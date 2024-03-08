import {
  defineTemplate,
  type Block,
  type LibraryBlock,
  type Test,
} from "@/lib/stores/blocks/model/loose";
import { exhaustive, isTruthy, type Falsy } from "@/lib/utils/typescript";
import { AnyBlock } from "@/routes/test/edit/blocks/AnyBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { CloudCog, FileSliders, Layers } from "lucide-react";
import { nanoid } from "nanoid";
import { useMemo, useState } from "react";

interface ToolboxCategory {
  id: string;
  name: string;
  icon: "scenarios" | "basic" | "api";
  blocks: Block[];
}

const DEFAULT_CATEGORY: ToolboxCategory = {
  id: "scenarios",
  name: "Scenarios",
  icon: "scenarios",
  blocks: [
    defineTemplate({
      id: "scenario-template",
      type: "scenario",
      executor: null,
      name: "",
      step: null,
    }),
    defineTemplate({
      id: "executor-template",
      type: "executor",
      executor: {
        type: "constant-vus",
        vus: 1,
        duration: "1m",
      },
    }),
  ],
};

const CATEGORIES: ToolboxCategory[] = [
  DEFAULT_CATEGORY,
  {
    id: "steps",
    name: "Steps",
    icon: "basic",
    blocks: [
      defineTemplate({
        id: "group-template",
        type: "group",
        name: "",
        step: null,
        next: null,
      }),
      defineTemplate({
        id: "http-request-template",
        type: "http-request",
        method: "get",
        url: "",
        name: "",
        parameters: {},
        next: null,
      }),
      defineTemplate({
        id: "check-template",
        type: "check",
        target: null,
        checks: [
          {
            id: nanoid(),
            type: "status",
            value: 200,
          },
        ],
        next: null,
      }),
      defineTemplate({
        id: "sleep-template",
        type: "sleep",
        seconds: 1,
        next: null,
      }),
    ],
  },
];

interface CategoryHeadingProps {
  category: ToolboxCategory;
}

function CategoryIcon({ category }: CategoryHeadingProps) {
  switch (category.icon) {
    case "scenarios":
      return <FileSliders size={24} />;

    case "basic":
      return <Layers size={24} />;

    case "api":
      return <CloudCog size={24} />;

    default:
      return exhaustive(category.icon);
  }
}

interface ToolboxProps {
  test: Test;
}

function Toolbox({ test }: ToolboxProps) {
  const [current, setCurrent] = useState(DEFAULT_CATEGORY);

  const categories: ToolboxCategory[] = useMemo(() => {
    const baseUrl = test.library.servers?.[0]?.url ?? "";

    const blocks = Object.entries(test.library.paths ?? {}).flatMap(([path, methods]) => {
      if (methods === undefined) {
        return [];
      }

      const a: Array<LibraryBlock | Falsy> = [
        methods.get && {
          type: "library",
          id: nanoid(),
          method: "get",
          url: new URL(path, baseUrl).toString(),
          name: methods.get.summary || `GET ${path}`,
          parameters: {},
          next: null,
        },
        methods.post && {
          type: "library",
          id: nanoid(),
          method: "post",
          url: new URL(path, baseUrl).toString(),
          name: methods.post.summary || `POST ${path}`,
          parameters: {},
          next: null,
        },
      ];

      return a.filter(isTruthy);
    });

    const category: ToolboxCategory = {
      id: "api",
      name: test.library.info.title,
      icon: "api",
      blocks,
    };

    return [...CATEGORIES, category];
  }, [test.library]);

  function handleCategorySelect(id: string) {
    setCurrent(categories.find((category) => category.id === id) ?? DEFAULT_CATEGORY);
  }

  return (
    <div className="flex">
      <Tabs className="flex" value={current.id} onValueChange={handleCategorySelect}>
        <TabsList className="border-r-[1px]">
          {categories.map((category) => {
            return (
              <TabsTrigger
                key={category.id}
                className="flex flex-col items-center gap-2 p-4 hover:bg-slate-100 data-[state=active]:text-primary"
                value={category.id}
              >
                <span className="text-slate-400">
                  <CategoryIcon category={category} />
                </span>
                <span className="uppercase [writing-mode:vertical-lr]">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {categories.map((category) => {
          return (
            <TabsContent
              key={category.id}
              value={category.id}
              className="min-w-80 border-r-[1px] p-2"
            >
              <ul className="">
                {category.blocks.map((template) => {
                  return (
                    <li key={template.id} className="p-2">
                      <AnyBlock block={template} />
                    </li>
                  );
                })}
              </ul>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

export { Toolbox };
