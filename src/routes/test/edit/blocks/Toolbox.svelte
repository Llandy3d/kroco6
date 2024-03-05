<script lang="ts" context="module">
  import { defineTemplate, type Block } from "$lib/stores/blocks/model/loose";

  interface ToolboxCategory {
    id: string;
    name: string;
    blocks: Block[];
  }

  const CATEGORIES: ToolboxCategory[] = [
    {
      id: "scenarios",
      name: "Scenarios",
      blocks: [
        defineTemplate({
          id: "scenario-template",
          type: "scenario",
          name: "",
          step: null,
        }),
      ],
    },
    {
      id: "executors",
      name: "Executors",
      blocks: [
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
    },
    {
      id: "steps",
      name: "Steps",
      blocks: [
        defineTemplate({
          id: "group-template",
          type: "group",
          name: "",
          step: null,
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
      ],
    },
  ];

  const requests = derived(test, ($test) => {
    const baseUrl = $test.library.servers?.[0]?.url ?? "";

    return Object.entries($test.library.paths ?? {}).flatMap(([path, methods]) => {
      if (methods === undefined) {
        return [];
      }

      const a: Array<HttpRequestBlock | Falsy> = [
        methods.get && {
          type: "http-request",
          id: nanoid(),
          method: "get",
          url: new URL(path, baseUrl).toString(),
          name: methods.get.summary || `GET ${path}`,
          parameters: {},
          next: null,
        },
        methods.post && {
          type: "http-request",
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
  });
</script>

<script lang="ts">
  import { test } from "$lib/stores/blocks";
  import type { HttpRequestBlock } from "$lib/stores/blocks/model/strict";
  import { isTruthy, type Falsy } from "$lib/utils/typescript";
  import { nanoid } from "nanoid";
  import { derived } from "svelte/store";
  import AnyBlock from "./AnyBlock.svelte";
  import { dropmask } from "./primitives/dnd";
</script>

<div class="toolbox absolute bottom-0 top-0 flex flex-col" use:dropmask>
  <div class="m-4 mr-6 flex flex-auto list-none flex-col rounded-md bg-slate-200 p-0 shadow-md">
    {#each CATEGORIES as category (category.id)}
      <h2 class="p-2 font-bold">{category.name}</h2>
      <ul class="">
        {#each category.blocks as template (template.type)}
          <li class="border-b border-gray-200 p-2">
            <AnyBlock block={template} />
          </li>
        {/each}
      </ul>
    {/each}
    <ul>
      <h2 class="p-2 font-bold">{$test.library.info.title}</h2>
      {#each $requests as template (template.id)}
        <li class="border-b border-gray-200 p-2">
          <AnyBlock block={template} />
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .toolbox {
    transform: translateX(-90%);
    transition: transform 0.3s;
    z-index: 1000;
  }

  .toolbox:hover {
    transform: translateX(0);
  }
</style>
