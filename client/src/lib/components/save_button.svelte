<script>
  import { onMount } from "svelte";
  export let state = "inactive";

  import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

  function requestSave() {
		dispatch('requestSave');
	}


</script>

<button on:click={requestSave} disabled={state != "unsaved"} class="{state} relative p-2 rounded-lg flex gap-2">
  <svg class="icon w-6 h-6" viewBox="0 0 32 32"  xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M20 7V2H22.8211C23.3437 2 23.8456 2.20459 24.2193 2.56999L29.3982 7.63383C29.7831 8.01011 30 8.52562 30 9.06384V28C30 29.1046 29.1046 30 28 30H4C2.89543 30 2 29.1046 2 28V4C2 2.89543 2.89543 2 4 2H7V7C7 8.10457 7.89543 9 9 9H18C19.1046 9 20 8.10457 20 7ZM9 14C7.89543 14 7 14.8954 7 16V24C7 25.1046 7.89543 26 9 26H23C24.1046 26 25 25.1046 25 24V16C25 14.8954 24.1046 14 23 14H9Z" />
    <path d="M12 2H18V6C18 6.55228 17.5523 7 17 7H12V2Z" />
  </svg>

  <svg class="circle absolute w-5 h-5 bottom-0 right-0 animate-spin" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="stroke-white" d="M16 26C14.0222 26 12.0888 25.4135 10.4443 24.3147C8.79981 23.2159 7.51808 21.6541 6.7612 19.8268C6.00433 17.9996 5.80629 15.9889 6.19215 14.0491C6.578 12.1093 7.53041 10.3275 8.92893 8.92893C10.3275 7.53041 12.1093 6.578 14.0491 6.19215C15.9889 5.80629 17.9996 6.00433 19.8268 6.7612C21.6541 7.51808 23.2159 8.79981 24.3147 10.4443C25.4135 12.0888 26 14.0222 26 16"
    stroke-width="6"/>
    <path class="stroke-white/50" d="M26 16C26 17.3132 25.7413 18.6136 25.2388 19.8268C24.7362 21.0401 23.9997 22.1425 23.0711 23.0711C22.1425 23.9997 21.0401 24.7362 19.8268 25.2388C18.6136 25.7413 17.3132 26 16 26"
    stroke-width="6"/>
  </svg>

</button>

<style>

  button,svg{
    @apply transition-all duration-100;
  }

  button.inactive {
    @apply bg-gray-700/40;
  }

  button.inactive .icon {
    @apply fill-gray-200;
  }

  button.saved {
    @apply bg-green-500/40;
  }

  button.saved .icon {
    @apply fill-green-500;
  }

  button.unsaved {
    @apply bg-orange-500/40;
  }

  button.unsaved .icon {
    @apply fill-orange-500;
  }

  button.saving {
    @apply bg-indigo-500/40;
  }

  button.saving .icon {
    @apply fill-indigo-500;
  }

  .circle {
    @apply hidden opacity-0 transition-all duration-100;
  }

  button.saving .circle {
    @apply block;
  }


</style>
