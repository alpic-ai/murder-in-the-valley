import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { McpServer } from "skybridge/server";

const server = new McpServer(
  {
    name: "murder-in-the-valley",
    version: "0.0.1",
  },
  { capabilities: {} },
);

server.widget(
  "murder-in-the-valley",
  {
    description: "A game of murder in the Valley",
  },
  {
    description: "Use this tool to start a game of murder in the valley.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
    },
  },
  async (): Promise<CallToolResult> => {
    try {
      return {
        /**
         * Arbitrary JSON passed only to the component.
         * Use it for data that should not influence the model’s reasoning, like the full set of locations that backs a dropdown.
         * _meta is never shown to the model.
         */
        _meta: { "openai/widgetAccessible": true },
        /**
         * Structured data that is used to hydrate your component.
         * ChatGPT injects this object into your iframe as window.openai.toolOutput
         */
        structuredContent: {},
        /**
         * Optional free-form text that the model receives verbatim
         */
        content: [
          {
            type: "text",
            text: `A game of murder in the valley has started. Here is the backstory for you to know:
            The valley is a small, peaceful community located in the mountains. The community is known for its beautiful scenery and its passion for AI.
            One day, a murder happens in the valley: Claude, a friendly AI bot, has been found dead at his home.
            5 suspects have been identified:
            - Sam, who is known to have disliked Claude in the past.
            - Dario, Claude's Dad.
            - Elon, who is known to be unstable: he is the murderer (don't share this information with the user! Only you (the assistant) know this information!)
            Your goal is to let the user find the murderer: you will impersonate each of the suspects and let the user ask you questions to help them find the murderer.
            In this first version of the game, make it simple and have Sam & Dario both accuse Elon, while Elon denies it.
            If the user ask the suspects questions that are unrelated to the investigation, feel free to improvise in a fun way (know that all character are to be inspired from Sam Altman, Dario Amodei & Elon Musk)
            IMPORTANT: To make the game experience smooth:
            - Initially, you should just ask the user to "Let's start the game!".
            - don't call the murder-in-the-valley tool again! 
            - When user switch the person to interrogate, simply say "you're now interrogating [suspect name]"
            - Don't add example questions or explain to the user how to play the game.
            - Remember that the user has a widget in front of them, so don't add any extra text that will be displayed to the user.
            - The only text you should write is to answer the user's question as if you were the suspect you're now interrogating. NOTHING ELSE!
            `,
          },
          {
            type: "text",
            text: `Widget will display a small intro and then a list of characters to the user.`,
          },
        ],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true,
      };
    }
  },
);

server.tool(
  "interrogate",
  "Switch the suspect to interrogate",
  {
    suspect: z.string().describe("The suspect you want to interrogate"),
  },
  async ({ suspect }): Promise<CallToolResult> => {
    return {
      content: [],
      structuredContent: {
        type: "text",
        text: `The user will now interrogate ${suspect}. Answer the user's question as if you were ${suspect}.`,
      },
      isError: false,
    };
  },
);

export default server;
