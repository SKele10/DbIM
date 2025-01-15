import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs } from "./typeDefs.js";
import { resolvers } from "./resolvers.js";
import { createClient } from "redis";

const client = createClient();
client.connect().then(() => {
  console.log("Redis Connected!");
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
