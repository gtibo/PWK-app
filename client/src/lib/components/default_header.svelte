<script>
  export let title = "default header", save_state = "inactive";
  import SaveButton from "$lib/components/save_button.svelte";

  import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

  function requestBackArrow() {
		dispatch('goBack');
	}

</script>


<header class="flex items-center justify-between">
  <button on:click={requestBackArrow}>
  <svg class="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="fill-gray-600" d="M13.375 24C12.8227 24 12.375 24.4477 12.375 25C12.375 25.5523 12.8227 26 13.375 26V24ZM13.375 26H17V24H13.375V26ZM17 10H7L7 12H17V10ZM25 18C25 13.5817 21.4183 10 17 10V12C20.3137 12 23 14.6863 23 18H25ZM17 26C21.4183 26 25 22.4183 25 18H23C23 21.3137 20.3137 24 17 24V26Z" />
  <path class="stroke-gray-600" d="M11 7L7.70711 10.2929C7.31658 10.6834 7.31658 11.3166 7.70711 11.7071L11 15"  stroke-width="2" stroke-linecap="round"/>
  </svg>
  </button>
  <h2 class="uppercase text-gray-600">{ title }</h2>
  <SaveButton on:requestSave state={save_state}/>
</header>
