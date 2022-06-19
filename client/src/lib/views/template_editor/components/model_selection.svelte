<script>
  export let models = [], selection_id = 0;
  import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

  function requestCreation() {
		dispatch('confirm');
	}

</script>

<div class="flex-1 flex flex-col gap-2">
  {#each models as model, index}
    <input class="hidden" id="model-select-{model.name}" type="radio" bind:group={selection_id} name="model" value={index}>
    <label class="relative block" for="model-select-{model.name}">
      <svg class="absolute w-full h-full fill-white aspect-square" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        {@html model.icon}
      </svg>
    </label>
  {/each}
</div>

<button class="confirm-btn" on:click={requestCreation}>Create a {models[selection_id].name}</button>

<style>
label {
  @apply flex-1 rounded-xl bg-indigo-500/50;
}

input[type="radio"]:checked+label {
  @apply bg-indigo-500/90;
}

svg {
  @apply scale-90 transition;
}

input[type="radio"]:checked+label>svg {
  @apply scale-100;
}

.confirm-btn {
  @apply font-semibold text-xl text-white bg-green-500 p-4 rounded-xl;
}
</style>
