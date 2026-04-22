#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from 'axios';

// Récupération des variables d'environnement
const IBM_API_KEY = process.env.IBM_WATSONX_API_KEY;
const DEFAULT_DOCUMENT_LIBRARY_ID = process.env.WATSONX_DOCUMENT_LIBRARY_ID;
const DEFAULT_CONTAINER_ID = process.env.WATSONX_CONTAINER_ID;

if (!IBM_API_KEY) {
  throw new Error('IBM_WATSONX_API_KEY environment variable is required');
}
if (!DEFAULT_DOCUMENT_LIBRARY_ID) {
  throw new Error('WATSONX_DOCUMENT_LIBRARY_ID environment variable is required');
}
if (!DEFAULT_CONTAINER_ID) {
  throw new Error('WATSONX_CONTAINER_ID environment variable is required');
}

// URL de l'API d'authentification IBM
const AUTH_URL = 'https://iam.cloud.ibm.com/identity/token';
// URL de l'API de retrieval watsonx.Data
const RETRIEVAL_URL = 'https://console-ibm-cator.lakehouse.saas.ibm.com/api/v1/retrieval/search';

// Interface pour le token d'authentification
interface AuthToken {
  access_token: string;
  expires_in: number;
  expiration: number;
}

// Cache du token
let cachedToken: AuthToken | null = null;

/**
 * Obtient un token d'authentification IBM
 */
async function getAuthToken(): Promise<string> {
  // Vérifier si le token en cache est encore valide
  if (cachedToken && cachedToken.expiration > Date.now() / 1000) {
    return cachedToken.access_token;
  }

  try {
    const response = await axios.post<AuthToken>(
      AUTH_URL,
      `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${IBM_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );

    cachedToken = response.data;
    return response.data.access_token;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Authentication error: ${error.response?.data?.errorMessage || error.message}`);
    }
    throw error;
  }
}

// Création du serveur MCP
const server = new McpServer({
  name: "watsonx-retrieval",
  version: "1.0.0"
});

/**
 * Outil pour effectuer une recherche dans watsonx.Data retrieval service
 */
server.tool(
  "search_watsonx_retrieval",
  {
    query: z.string().describe("La requête de recherche à exécuter"),
    document_library_id: z.string().optional().describe("L'ID de la bibliothèque de documents (optionnel, utilise la valeur par défaut si non fourni)"),
    container_id: z.string().optional().describe("L'ID du conteneur (optionnel, utilise la valeur par défaut si non fourni)"),
    container_type: z.string().default("project").describe("Le type de conteneur (par défaut: 'project')"),
    inference_model_id: z.string().default("meta-llama/llama-3-3-70b-instruct").describe("L'ID du modèle d'inférence"),
    vector_limit: z.number().default(10).describe("Limite de résultats pour la recherche vectorielle"),
    enable_sql_search: z.boolean().default(true).describe("Activer la recherche SQL"),
    enable_vector_search: z.boolean().default(true).describe("Activer la recherche vectorielle"),
    enable_inference: z.boolean().default(true).describe("Activer l'inférence de recherche"),
    provide_suggested_template: z.boolean().default(false).describe("Fournir un template suggéré")
  },
  async ({
    query,
    document_library_id,
    container_id,
    container_type,
    inference_model_id,
    vector_limit,
    enable_sql_search,
    enable_vector_search,
    enable_inference,
    provide_suggested_template
  }: {
    query: string;
    document_library_id?: string;
    container_id?: string;
    container_type: string;
    inference_model_id: string;
    vector_limit: number;
    enable_sql_search: boolean;
    enable_vector_search: boolean;
    enable_inference: boolean;
    provide_suggested_template: boolean;
  }) => {
    try {
      // Obtenir le token d'authentification
      const token = await getAuthToken();

      // Utiliser les valeurs par défaut si non fournies
      const finalDocumentLibraryId = document_library_id || DEFAULT_DOCUMENT_LIBRARY_ID;
      const finalContainerId = container_id || DEFAULT_CONTAINER_ID;

      // Construire le body de la requête
      const requestBody = {
        query,
        document_library_id: finalDocumentLibraryId,
        container_id: finalContainerId,
        container_type,
        searchConfig: [
          {
            type: "sql",
            enabled: enable_sql_search
          },
          {
            type: "vector",
            limit: vector_limit,
            enabled: enable_vector_search
          }
        ],
        search_inference_config: {
          enabled: enable_inference,
          inference_model_id
        },
        provide_suggested_template
      };

      // Effectuer la requête de recherche
      const response = await axios.post(
        RETRIEVAL_URL,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }
        ]
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return {
          content: [
            {
              type: "text",
              text: `Erreur API watsonx.Data: ${error.response?.data?.message || error.message}\nStatus: ${error.response?.status}\nDétails: ${JSON.stringify(error.response?.data, null, 2)}`
            }
          ],
          isError: true
        };
      }
      throw error;
    }
  }
);

// Démarrer le serveur sur stdio
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Serveur MCP watsonx.Data retrieval démarré sur stdio');

// Made with Bob
