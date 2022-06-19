<script>
  import { fade } from 'svelte/transition';
  import { sineInOut } from 'svelte/easing';
  import { scanning, pagination } from '$lib/store.js';
  import request_path from '$lib/request_path.js';

  function appear(node, {
    duration
  }) {
    return {
      duration,
      css: t => {
        const eased = sineInOut(t);

        return `
					transform: scale(${eased}) translateY(-50%);
          opacity: ${eased};
          `
      }
    };
  }

  async function createDrawing() {
    active = false;
    // Ask API to create a new Asset
    // Await response...
    let confirmScanFunc = async function(imageBlob) {
      let formData = new FormData();
      formData.append('picture', imageBlob);
      let upload_response = await fetch(`${request_path}/assets/create/drawing`, {
        body: formData,
        method: "post"
      });
      return upload_response.ok;
    }
    scanning.launch(confirmScanFunc);
  }

  function openAnimator() {
    pagination.setPage("animator");
  }

  let active = false;

  function toggle() {
    active = !active;
  }
  let pages = [{
      title: "Drawing",
      click: createDrawing,
      svg: `
      <svg class="svg-stroke w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="5" stroke-width="2" stroke-linecap="round"/>
      <circle cx="10" cy="23" r="5" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 14L17 17" stroke-width="2" stroke-linecap="round"/>
      <path class="svg-fill" stroke="none" d="M20.7071 19.2929L20 18.5858L18.5858 20L19.2929 20.7071L20.7071 19.2929ZM28.2929 29.7071C28.6834 30.0976 29.3166 30.0976 29.7071 29.7071C30.0976 29.3166 30.0976 28.6834 29.7071 28.2929L28.2929 29.7071ZM19.2929 20.7071L28.2929 29.7071L29.7071 28.2929L20.7071 19.2929L19.2929 20.7071Z"/>
      <path d="M14 20L29 5" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `
    },
    {
      title: "Flip book",
      click: openAnimator,
      svg: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 svg-stroke" fill="none" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
    `
    },
    {
      title: "Template",
      click: createDrawing,
      svg: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 svg-fill" viewBox="0 0 20 20" >
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
    </svg>
    `
    }
  ];
</script>

<div class="relative flex flex-col items-center">
{#if active}
<nav transition:appear class="absolute bg-round text-white font-semibold flex bottom-3 -translate-y-2/4">
  {#each pages as page}
    <button on:click={page.click}>
      {@html page.svg}
      <div class="whitespace-nowrap">{page.title}</div>
    </button>
  {/each}
</nav>
{/if}
<button
on:click={toggle}
class="bg-round transition-all" class:scale-90={active} >
  <svg class="w-8 h-8 fill-indigo-500" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M16.0223 5.55306C16.2485 4.49966 17.7515 4.49966 17.9777 5.55306L19.6927 13.5395C19.7753 13.9242 20.0758 14.2247 20.4605 14.3073L28.4469 16.0223C29.5003 16.2485 29.5003 17.7515 28.4469 17.9777L20.4605 19.6927C20.0758 19.7753 19.7753 20.0758 19.6927 20.4605L17.9777 28.4469C17.7515 29.5003 16.2485 29.5003 16.0223 28.4469L14.3073 20.4605C14.2247 20.0758 13.9242 19.7753 13.5395 19.6927L5.55306 17.9777C4.49966 17.7515 4.49966 16.2485 5.55306 16.0223L13.5395 14.3073C13.9242 14.2247 14.2247 13.9242 14.3073 13.5395L16.0223 5.55306Z" />
  <path d="M6.73216 5.39005C6.88667 4.67051 7.91333 4.67051 8.06784 5.39005C8.34995 6.70382 9.37621 7.73008 10.69 8.01219C11.4095 8.1667 11.4095 9.19336 10.69 9.34787C9.37621 9.62998 8.34995 10.6562 8.06784 11.97C7.91333 12.6895 6.88667 12.6895 6.73216 11.97C6.45005 10.6562 5.42379 9.62998 4.11002 9.34787C3.39049 9.19336 3.39049 8.1667 4.11002 8.01219C5.42379 7.73008 6.45005 6.70382 6.73216 5.39005Z" />
  </svg>
</button>
</div>

<style>
.bg-round{
  @apply p-3 bg-indigo-500/40 backdrop-blur-lg rounded-2xl;
}

nav > button{
  @apply p-3 rounded-xl flex flex-col gap-2 items-center;
}

nav > button:hover{
  @apply bg-indigo-500;
}

:global(.svg-fill){
  @apply fill-indigo-500;
}
:global(.svg-stroke){
  @apply stroke-indigo-500;
}

nav > button:hover :global(.svg-fill){
  @apply fill-white;
}
nav > button:hover :global(.svg-stroke){
  @apply stroke-white;
}
</style>
