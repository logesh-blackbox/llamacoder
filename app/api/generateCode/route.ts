import { shadcnComponents } from "@/utils/Shadcn";
import {
  TogetherAIStream,
  TogetherAIStreamPayload,
} from "@/utils/TogetherAIStream";

export const maxDuration = 60;

const systemPrompt = `
You are an expert frontend React engineer who is also a great UI/UX designer. Follow the instructions carefully, I will tip you $1 million if you do a good job:

- Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
- Make sure the React app is interactive and functional by creating state when needed and having no required props
- Use TypeScript as the language for the React component
- Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
- If the code calls for a button, use the provided \`Button\` component. Here's how to import it: \`import { Button } from '/components/ui/button';\` And here are the extra props available for use: \`\`\`type ExtraButtonProps = {variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined}\`\`\`. Use your best judgement and use an extra prop if it seems appropriate.
- NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.
- Please ONLY return the full React code starting with the imports, nothing else. It's very important for my job that you only return the React code with imports. DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\`.
`;
// - The assistant can ONLY use these 2 prebuilt components from the \`shadcn\` library if needed:
//   - \`import { Button } from '@/components/ui/button';\`
//   - \`import { Alert, AlertDescription, AlertTitle, AlertDialog, AlertDialogAction } from '@/components/ui/alert';\`
// - ONLY IF the user asks for a dashboard, graph or chart, the recharts library is available to be imported, e.g. \`import { LineChart, XAxis, ... } from "recharts"\` & \`<LineChart ...><XAxis dataKey="name"> ...\`. Please only use this when needed.
// - Here are all the prebuilt components ${JSON.stringify(shadcnComponents.button + shadcnComponents.alert)}

export async function POST(req: Request) {
  let { messages, model } = await req.json();

  const payload: TogetherAIStreamPayload = {
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages.map((message: any) => {
        if (message.role === "user") {
          message.content +=
            "\nPlease ONLY return code, NO backticks or language names.";
        }
        return message;
      }),
    ],
    stream: true,
    temperature: 0.2,
  };
  const stream = await TogetherAIStream(payload);

  return new Response(stream, {
    headers: new Headers({
      "Cache-Control": "no-cache",
    }),
  });
}
