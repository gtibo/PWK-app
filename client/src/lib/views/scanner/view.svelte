<script>
  import { onMount } from "svelte";
  import { scanning } from '$lib/store.js';
  import { cvHelper } from "$lib/cvHelper.js";
  import { fly } from 'svelte/transition';

  import DefaultHeader from "$lib/components/default_header.svelte";
  import DefaultBody from "$lib/components/default_body.svelte";


  let canvas, ctx;
  let compute = false, valide = false, saving = false;

  onMount(() => {
    ctx = canvas.getContext("2d");
  });

  function loadImage(file) {
    return new Promise((res, rej) => {
      let image = new Image();
      image.onload = function() {
        res(image)
      };
      image.src = URL.createObjectURL(file);
    });

  }

  async function onFileSelection(e) {
    let file = e.target.files[0];
    if (!file) return;
    valide = false;
    compute = true;
    // Let's compute
    let image = await loadImage(file);
    canvas.width = Math.min(image.width, 1920);
    canvas.height = canvas.width * image.height / image.width;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Process imageData with OPENCV
    let res = await cvHelper.use({
      imageData
    }, ["getAPage", "crop"]);
    canvas.width = res.width;
    canvas.height = res.height;
    ctx.putImageData(res, 0, 0);
    URL.revokeObjectURL(image.src);
    compute = false;
    valide = true;
  }

  async function confirmScan() {
    saving = true;
    let blob = await new Promise(function(resolve, reject) {
      canvas.toBlob(function(blob) {
        resolve(blob);
      });
    });
    $scanning.confirmScanFunc(blob).then((worked) => {
      if (worked) scanning.close();
    });
  }

  function cancel(){
    $scanning.confirmScanFunc(false);
    scanning.close();
  }

  let save_state = "inactive";
  $: {
    if(saving){
      save_state = "saving";
    }else if(valide) save_state = "unsaved";
  };

</script>


<div transition:fly="{{y: 50}}" class="fixed z-10 w-screen h-screen bg-white z-20">
  <DefaultBody>
    <DefaultHeader
    on:goBack={cancel}
    title="Scanner"
    {save_state}
    on:requestSave={confirmScan}
    />
    <label
    class="picture-label"
    class:tile-bg={valide}
    for="fileInput">
    <div class="corner tl">
      <svg class="w-6 h-6 stroke-gray-300" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 30V10C2 5.58172 5.58172 2 10 2H30" stroke-width="4" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="corner tr">
      <svg class="w-6 h-6 stroke-gray-300" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 30V10C30 5.58172 26.4183 2 22 2H2" stroke="#D2D2E4" stroke-width="4" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="corner bl">
      <svg class="w-6 h-6 stroke-gray-300" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2V22C2 26.4183 5.58172 30 10 30H30" stroke="#D2D2E4" stroke-width="4" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="corner br">
      <svg class="w-6 h-6 stroke-gray-300" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 2V22C30 26.4183 26.4183 30 22 30H2" stroke="#D2D2E4" stroke-width="4" stroke-linecap="round"/>
      </svg>
    </div>
    <canvas class="absolute w-full h-full object-contain" class:hidden={compute} bind:this={canvas}/>

    <div class:hidden={valide} class="flex flex-col gap-2 items-center">
      <svg class="w-14 h-14 fill-gray-300" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M19.5724 4.46155C20.3495 4.46155 21.0562 4.91163 21.3848 5.61578L22.4614 7.9227C22.79 8.62685 23.4967 9.07693 24.2737 9.07693H29C30.1046 9.07693 31 9.97236 31 11.0769V25.5385C31 26.643 30.1046 27.5385 29 27.5385H3C1.89543 27.5385 1 26.643 1 25.5385V11.0769C1 9.97236 1.89543 9.07693 3 9.07693H7.72627C8.50332 9.07693 9.21004 8.62685 9.53864 7.9227L10.6152 5.61578C10.9438 4.91163 11.6505 4.46155 12.4276 4.46155H19.5724ZM16 23C18.7614 23 21 20.7614 21 18C21 15.2386 18.7614 13 16 13C13.2386 13 11 15.2386 11 18C11 20.7614 13.2386 23 16 23Z" />
      </svg>
      <h3 class="lowercase font-semibold text-sm text-gray-400">Take a picture</h3>
    </div>

    <input id="fileInput" on:change={onFileSelection} class="hidden" type="file" accept="image/*" capture="camera">
    </label>
  </DefaultBody>
</div>

<style>
.picture-label{
  @apply bg-origin-padding rounded-lg p-4 flex-1 flex items-center justify-center relative;

}

.corner{
  @apply absolute;
}

.corner.tl{
  @apply left-0 top-0;
}
.corner.tr{
  @apply right-0 top-0;
}
.corner.bl{
  @apply left-0 bottom-0;
}
.corner.br{
  @apply right-0 bottom-0;
}
</style>
