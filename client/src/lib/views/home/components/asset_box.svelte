<script>

  export let
  id = 0,
  name = "untilted",
  type = "unknow",
  vignette = "/";

  import { createEventDispatcher } from 'svelte';
  import request_path from '$lib/request_path.js';


	const dispatch = createEventDispatcher();

  function requestDeletion() {
		dispatch('delete');
	}

  function requestEdition() {
		dispatch('edit');
	}

  import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

  let wait_time = 2000;

  const progress = tweened(0, {
		duration: wait_time,
		easing: cubicOut
	});

  let delete_timeout = null;

  let deleting = false;

  function deleteDown() {
    deleting = true;
    progress.set(0, { duration : 0 });
    progress.set(1);
    delete_timeout = setTimeout(requestDeletion, wait_time);
  }
  function deleteUp() {
    clearTimeout(delete_timeout);
    progress.set(0);
    deleting = false;
  }

</script>

<div class="relative border border-gray-300 rounded-lg overflow-hidden">

  <div class:deleting={deleting} class="absolute w-full h-full p-4 flex opacity-0 transition-all items-center justify-center pointer-events-none	">
    <h4 class="z-10 text-white font-semibold text-2xl">Deleting...</h4>
    <div
    class="absolute w-full h-full bottom-0 bg-orange-500/40">
    </div>

    <div
    style="height:{$progress * 100}%;"
    class="absolute w-full bottom-0 bg-orange-500/80">
    </div>
  </div>

  <img class="w-full tile-bg aspect-video	object-contain" src="{request_path}/{vignette.path}"/>
  <footer class="flex gap-2 p-2 justify-between items-center">
    <h3 class="font-semibold text-gray-600">
      <span class="text-xs text-gray-400">{type}</span>
      {name}
    </h3>
    <div class="flex">
      <button class="px-3 py-2 bg-green-500/50 rounded-l-xl" on:click={requestEdition}>
        <svg class="w-6 h-6 fill-green-500" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.0696 5.77711L4.41235 22.4343L3.32273 28.3372C3.25912 28.6819 3.56057 28.9833 3.90519 28.9197L9.80809 27.8301L26.4653 11.1728L21.0696 5.77711Z"/>
          <path d="M25.2616 1.58504L22.0494 4.79727L27.4451 10.193L30.6574 6.98078C31.0479 6.59025 31.0479 5.95709 30.6574 5.56656L26.6759 1.58504C26.2853 1.19451 25.6522 1.19451 25.2616 1.58504Z"/>
        </svg>
      </button>
      <button
      on:pointerdown={deleteDown}
      on:pointerup={deleteUp}
      class="px-3 py-2 bg-orange-500/50 rounded-r-xl touch-none">
        <svg class="w-6 h-6 fill-orange-500" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M7.82857 6.902V5.13368C7.82857 2.29843 10.1311 0 12.9714 0H19.0667C21.907 0 24.2095 2.29843 24.2095 5.13368V6.902H25.7143C26.9767 6.902 28 7.92353 28 9.18364V12.6061H4V9.18364C4 7.92353 5.02335 6.902 6.28571 6.902H7.82857ZM11.2571 5.13368C11.2571 4.1886 12.0247 3.42245 12.9714 3.42245H19.0667C20.0134 3.42245 20.781 4.18859 20.781 5.13368V6.902H11.2571V5.13368Z" />
          <path d="M4 14.8877L6.55962 30.0964C6.74456 31.1952 7.69752 32 8.81375 32H23.1863C24.3025 32 25.2554 31.1952 25.4404 30.0964L28 14.8877H4Z" />
        </svg>
      </button>
    </div>
  </footer>
</div>


<style>

.deleting{
  @apply opacity-100 flex;
}


</style>
