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
  import { test } from "$lib/stores/blocks";
  import type { LibraryBlock } from "$lib/stores/blocks/model/strict";
  import { isTruthy, type Falsy } from "$lib/utils/typescript";
  import { Button } from "bits-ui";
  import clsx from "clsx";
  import { FileSliders, Layers, Server } from "lucide-svelte";
  import { nanoid } from "nanoid";
  import { derived, type Readable } from "svelte/store";
  import AnyBlock from "./AnyBlock.svelte";
  import { dropmask } from "./primitives/dnd";

  const current: ToolboxCategory = DEFAULT_CATEGORY;

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
  <div class="flex flex-col items-center border-r-[1px]">
    {#each categories as category (category.id)}
      <Button.Root
        class={clsx(
          "flex flex-col items-center gap-2 p-5 text-slate-300 hover:bg-slate-100",
          category.id === current.id && "text-primary",
        )}
      >
        {#if category.icon === "scenarios"}
          <FileSliders size={24} />
        {:else if category.icon === "basic"}
          <Layers size={24} />
        {:else if category.icon === "api"}
          <Server size={24} />
        {/if}
        <span class="uppercase text-slate-500 [writing-mode:vertical-lr]">
          {category.name}
        </span>
      </Button.Root>
    {/each}
  </div>

  <div class="border-r-[1px]">
    <h2 class="p-2 font-bold uppercase">{current.name}</h2>
    <ul class="">
      {#each current.blocks as template (template.type)}
        <li class="p-2">
          <AnyBlock block={template} />
        </li>
      {/each}
    </ul>
  </div>
</div>
