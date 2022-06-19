<script>
  import RangeSlider from "svelte-range-slider-pips";
  import { tweened } from 'svelte/motion';
  import { backOut } from 'svelte/easing';
  import { flip } from 'svelte/animate';
  import request_path from '$lib/request_path.js';
  
  const progress = tweened(0, {
    duration: 400,
    easing: backOut
  });

  export let frames = [ ], disabled = false;
  let frame_per_view = 3;
  let range_value = [0];
  let timeline;

  $ : progress.set(range_value[0]);
  $ : max_scroll_step = (frames.length + 1)-frame_per_view;
  $ : frame_percent = 100/frame_per_view;

  // Frame exchange

  let frame_selected = null;
  export let frame_focus = 0;
  let start_pointer_x = 0;

  function pointerdown(e, i){
    start_pointer_x = e.clientX;
    frame_selected = frame_focus = i;
  }

  function pointermove(e){
    if(frame_selected == null) return;
    let offset_x = start_pointer_x - e.clientX;
    let frame_width = timeline.clientWidth / frame_per_view;
    let crank = Math.round(offset_x / frame_width);
    if(Math.abs(crank) < 1) return;
    start_pointer_x -= frame_width * crank;
    move_frame(-crank);
  }

  function pointerup(e){
    frame_selected = null;
  }

  function move_frame(offset){
    let originINDEX = frame_selected,
        destinationINDEX = frame_selected + offset;
    // Can't switch if out of bound
    if (destinationINDEX < 0 || destinationINDEX > frames.length - 1) return;
    [frames[originINDEX], frames[destinationINDEX]] = [frames[destinationINDEX], frames[originINDEX]];
    frame_selected = frame_focus = destinationINDEX;
    warnOrderChange();
  }

  // Custom signal

  import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

  function requestNewFrame() {
		dispatch('addFrame');
	}

  function warnOrderChange() {
		dispatch('orderchange');
	}

</script>

<svelte:window on:pointermove={pointermove} on:pointerup={pointerup}/>

<div bind:this={timeline} class="timeline">
  <div class="frames" class:disabled={disabled} style="left:{-frame_percent * $progress}%;">
    {#each frames as frame, i (frame.id)}
      <!-- All frames -->
      <div
      class="frame" class:selected={i == frame_selected} class:focus={i == frame_focus}
      on:pointerdown={(e)=>{pointerdown(e, i)}}
      style="min-width:{frame_percent}%;"
      animate:flip="{{duration: 150}}"
      >
        <div class="inside" style="background-image:url({request_path}/{frame.path});">
        </div>
      </div>
    {/each}
    <!-- Add button -->
    <button
    disabled={disabled}
    on:click={requestNewFrame} class="frame group" style="min-width:{frame_percent}%;">
      <div class="flex flex-col items-center justify-center gap-2">
        <div class="p-4 bg-indigo-500/50 group-disabled:bg-gray-500 rounded-full">
          <svg class="w-8 h-8 stroke-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 5V27" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M27 16L5 16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h4 class="font-semibold text-sm text-gray-500">Add Frame</h4>
       </div>
    </button>
  </div>
</div>
<RangeSlider pips max={Math.max(1, max_scroll_step)} bind:values={range_value}/>

<style>
  .timeline{
    @apply overflow-hidden;
    height: 15vh;
  }
  .frames{
    @apply relative flex h-full;
  }

  .frames.disabled{
    @apply grayscale pointer-events-none;
  }

  .frame{
    @apply p-2;
  }

  .frame .inside{
    @apply bg-contain bg-no-repeat bg-center
    transition bg-gray-300 w-full h-full rounded-xl flex items-center justify-center;
  }

  .frame.focus .inside{
    @apply bg-gray-100 border border-gray-500;
  }

  .frame.selected .inside{
    @apply -translate-y-2 shadow-[0em_.5em_.8em_rgba(0,0,0,0.3)] shadow-gray-500/40;
  }

  .default-range{
    @apply w-full h-2 bg-indigo-300 rounded-lg appearance-none;
  }
</style>
