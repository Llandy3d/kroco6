<script lang="ts" context="module">
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
        {
          id: "scenario-template",
          type: "scenario",
          name: "",
          parent: { type: "toolbox" },
        },
      ],
    },
    {
      id: "executors",
      name: "Executors",
      blocks: [
        {
          id: "executor-template",
          type: "executor",
          executor: { type: "constant-vus", vus: 1, duration: "1m" },
          parent: { type: "toolbox" },
        },
      ],
    },
    {
      id: "steps",
      name: "Steps",
      blocks: [
        {
          id: "group-template",
          type: "group",
          name: "",
          parent: { type: "toolbox" },
        },
        {
          id: "check-template",
          type: "check",
          checks: [
            {
              id: nanoid(),
              type: "has-status",
              status: 200,
            },
          ],
          parent: { type: "toolbox" },
        },
      ],
    },
  ];

  const requests = derived(blockTest, ($test) => {
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
          parent: { type: "toolbox" },
        },
        methods.post && {
          type: "http-request",
          id: nanoid(),
          method: "post",
          url: new URL(path, baseUrl).toString(),
          name: methods.post.summary || `POST ${path}`,
          parameters: {},
          parent: { type: "toolbox" },
        },
      ];

      return a.filter(isTruthy);
    });
  });
</script>

<script lang="ts">
  import type { Block, HttpRequestBlock } from "$lib/stores/test/types";
  import AnyBlock from "./AnyBlock.svelte";
  import { dropmask } from "./primitives/dnd";
  import { selected, library, blockTest } from "$lib/stores/test";
  import { exhaustive, isTruthy, type Falsy } from "$lib/utils/typescript";
  import { nanoid } from "nanoid";
  import { derived } from "svelte/store";

  function isCompatible(block: Block, selected: Block | null) {
    if (selected === null) {
      return true;
    }

    switch (selected.type) {
      case "scenario":
        return (
          block.type === "executor" ||
          block.type === "group" ||
          block.type === "http-request" ||
          block.type === "check"
        );

      case "http-request":
      case "executor":
        return false;

      case "group":
        return block.type === "group" || block.type === "http-request" || block.type === "check";

      case "check":
        return block.type === "http-request";

      default:
        return exhaustive(selected);
    }
  }
</script>

<div class="toolbox absolute bottom-0 top-0 flex flex-col" use:dropmask>
  <div class="m-4 mr-6 flex flex-auto list-none flex-col rounded-md bg-slate-200 p-0 shadow-md">
    {#each CATEGORIES as category (category.id)}
      <h2 class="p-2 font-bold">{category.name}</h2>
      <ul class="">
        {#each category.blocks as template (template.type)}
          <li
            class="border-b border-gray-200 p-2"
            class:opacity-50={!isCompatible(template, $selected)}
          >
            <AnyBlock block={template} />
          </li>
        {/each}
      </ul>
    {/each}
    <ul>
      <h2 class="p-2 font-bold">{$library.info.title}</h2>
      {#each $requests as template (template.id)}
        <li
          class="border-b border-gray-200 p-2"
          class:opacity-50={!isCompatible(template, $selected)}
        >
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