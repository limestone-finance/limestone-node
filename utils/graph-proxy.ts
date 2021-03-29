import axios from "axios";

// TODO: add response logging here
// because sometimes we recieve a strange error in any-swap fetcher

export default {
  async executeQuery(subgraphUrl: string, query: string): Promise<any> {
    const response = await axios.post(subgraphUrl, { query });
    return response.data;
  },
};
