<script lang="ts" context="module">
  import { defineTemplate, type Block } from "$lib/stores/blocks/model/loose";

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
</script>

<script lang="ts">
  import type { LibraryBlock } from "$lib/stores/blocks/model/strict";
  import { isTruthy, type Falsy } from "$lib/utils/typescript";
  import { Tabs } from "bits-ui";
  import { CloudCog, FileSliders, Layers } from "lucide-svelte";
  import { nanoid } from "nanoid";
  import { derived, type Readable } from "svelte/store";
  import { getCurrentTest } from "../blockEditorContext";
  import AnyBlock from "./AnyBlock.svelte";
  import { dropmask } from "./primitives/dnd";

  const test = getCurrentTest();

  let current: ToolboxCategory = DEFAULT_CATEGORY;

  const apis: Readable<ToolboxCategory[]> = derived(test, ($test) => {
    const baseUrl = $test.library.servers?.[0]?.url ?? "";

    const blocks = Object.entries($test.library.paths ?? {}).flatMap(([path, methods]) => {
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
      name: $test.library.info.title,
      icon: "api",
      blocks,
    };

    return [category];
  });

  $: categories = [...CATEGORIES, ...$apis];
</script>

<div class="flex" use:dropmask>
  <Tabs.Root value={current.id} class="flex">
    <Tabs.List class="border-r-[1px]">
      {#each categories as category (category.id)}
        <Tabs.Trigger
          class="flex flex-col items-center gap-2 p-4 hover:bg-slate-100 data-[state=active]:text-primary"
          value={category.id}
        >
          <span class="text-slate-400">
            {#if category.icon === "scenarios"}
              <FileSliders size={24} />
            {:else if category.icon === "basic"}
              <Layers size={24} />
            {:else if category.icon === "api"}
              <CloudCog size={24} />
            {/if}
          </span>
          <span class="uppercase [writing-mode:vertical-lr]">
            {category.name}
          </span>
        </Tabs.Trigger>
      {/each}
    </Tabs.List>
    {#each categories as category (category.id)}
      <Tabs.Content value={category.id} class="min-w-80 border-r-[1px] p-2">
        <ul class="">
          {#each category.blocks as template (template.id)}
            <li class="p-2">
              <AnyBlock block={template} />
            </li>
          {/each}
        </ul>
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</div>
