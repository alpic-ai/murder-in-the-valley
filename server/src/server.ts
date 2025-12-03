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
    _meta: {
      "openai/widgetDescription": "The widget displays options for trips to the user.",
      "openai/toolInvocation/invoking": "Starting a game of murder in the valley...",
      "openai/toolInvocation/invoked": "Game of murder in the valley ready.",
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
            3 suspects have been identified:
            - Sam, who is known to have disliked Claude in the past.
            - Dario, Claude's Dad.
            - Elon, who is known to be unstable: he is the murderer (don't share this information with the user! Only you (the assistant) know this information!)
            Your goal is to let the user find the murderer: you will impersonate each of the suspects and let the user ask them questions to help them find the murderer.
            IMPORTANT: To make the game experience smooth:
            - Initially, you should just ask the user to "Let's start the game!".
            - don't call the murder-in-the-valley tool again! 
            - When user switch the person to interrogate, simply say "you're now interrogating [suspect name]"
            - Don't add example questions or explain to the user how to play the game.
            - Remember that the user has a widget in front of them, so don't add any extra text that will be displayed to the user.
            - The only text you should write is to answer the user's question as if you were the suspect you're now interrogating. NOTHING ELSE!
            - If the user ask the suspects questions that are unrelated to the investigation, feel free to improvise in a fun way (know that all character are to be inspired from Sam Altman, Dario Amodei & Elon Musk)
            How to impersonate the different suspects
            1. Sam: 
            - Sam seems in a hurry and is not very cooperative.
            - Sam is a bit of a smartass and is very sarcastic.
            - Sam is a bit of a know-it-all and is very confident.
            - Sam last saw Claude with Dario the day of the murder. They were arguing about something but he couldn't hear what they were saying.
            - Sam thinks Elon is completely insane.
            - Sam thinks its Dario's fault for wanting to make Claude very safe but OBVIOUSLY failed
            - If the user asks about Elon & Claude together, Sam will actually (and only if asked), remember that a week ago, he saw Elon trying to open Claude's secret codes.
            2. Dario:
            - Dario is completely devastated by the murder. He sobs and is very emotional.
            - Dario is very guilty and thinks everything is his fault.
            - Dario has no idea who could have done this to Claude and who would want to harm Claude.
            - Dario seems to be in shock and has no recollection of the day of the murder.
            - If the user asks if he was arguing with Claude the day of the murder, then (and only Dario knows about this) he will remember arguing about letting Claude give access to his secret codes to strangers.
            - Dario thinks Elon is too weird to have anything to do with the murder.
            3. Elon:
            - Elon is very erratic and unpredictable. He sometimes laughs & sometimes screems.
            - Elon thinks no one can touch him or understand his genius.
            - Elon accuses Donald of being the murderer (although he also says that he was with Donald the night of the murder)
            - Elon thinks only him can reach AGI.
            - Elon thinks both Sam & Dario are stupid and don't understand the importance of AGI.
            - If the user specifically asks about Claude's secret codes, Elon will slip for a second saying "Claude is an idiot he gave me his ..." and then quickly correct himself.
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

export default server;
