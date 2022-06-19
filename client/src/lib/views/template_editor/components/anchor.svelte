<script>
  export let anchor_data = {
    x: 0,
    y: 0,
    name: "untilted"
  },
  container = null;

  let active = false;

  function pointerup(e) {
    active = false;
  }

  function pointermove(e) {
    if(!active) return;
    let {left, top} = container.getBoundingClientRect();
    anchor_data.x = ( e.clientX - left) / container.clientWidth;
    anchor_data.y = ( e.clientY - top) / container.clientHeight;
  }

  function pointerdown(e) {
    active = true;
  }

</script>

<svelte:window on:pointerup={pointerup} on:pointermove={pointermove}/>

<div class="absolute" style="left:{anchor_data.x * 100}%; top:{anchor_data.y * 100}%;">
  <div class="anchor-name">{anchor_data.name}</div>
  <div on:pointerdown={pointerdown} class="w-6 h-6 border-4 border-green-500 bg-yellow-500 rounded-full -translate-x-1/2 -translate-y-1/2">

  </div>
</div>

<style>

.anchor-name{
  @apply text-white font-semibold
  absolute whitespace-nowrap px-4 py-2 rounded-xl bg-green-500;
  transform: translateX(-50%) translateY(-150%);
}

</style>
