<script>
  export let anchors, texture, ratio = 1;
  import Anchor from "./anchor.svelte";
  import { onMount } from "svelte";
  let container, mounted = false;
</script>


<div
bind:this={container}
class="relative tile-bg flex-1 rounded-xl"
>
  <div class="absolute top-0 left-0 w-full h-full bg-no-repeat bg-contain bg-center"
  style="background-image:url({texture});">
  </div>
  {#each anchors as anchor_data}
    <Anchor {container} bind:anchor_data={anchor_data}/>
  {/each}
</div>
