<script>
  export let model, textures;
  import PartViewer from "./part_viewer.svelte";
  let selected_part_id = 0;

</script>

<PartViewer ratio={model.parts[selected_part_id].ratio} bind:anchors={model.parts[selected_part_id].anchors} texture={textures[selected_part_id]} />

<h4 class="font-semibold text-gray-400 uppercase text-center">
  {model.parts[selected_part_id].name}
</h4>

<footer class="flex h-1/6 gap-1">
  {#each model.parts as part, part_index}
    <input class="hidden" id="part-select-{part_index}" type="radio" bind:group={selected_part_id} name="model" value={part_index}>
    <label
    for="part-select-{part_index}"
    class="flex-1 bg-center bg-contain bg-no-repeat"
    style="background-image:url({textures[part_index]});"
    >
    </label>
  {/each}
</footer>


<style>
label {
  @apply flex-1 rounded-xl bg-indigo-500/50;
}

input[type="radio"]:checked+label {
  @apply bg-indigo-500/90;
}

</style>
