import { object, string, type Output } from "valibot";

const nameValuePair = object({
  id: string(),
  name: string(),
  value: string(),
});

type NameValuePair = Output<typeof nameValuePair>;

export { nameValuePair, type NameValuePair };
