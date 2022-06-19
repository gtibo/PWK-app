<script>
  import DefaultHeader from "$lib/components/default_header.svelte";
  import DefaultBody from "$lib/components/default_body.svelte";
  import Timeline from "./components/timeline.svelte";
  import { fade, scale } from 'svelte/transition';
  import request_path from '$lib/request_path.js';
  
  import { onMount } from "svelte";
  import { scanning, pagination } from '$lib/store.js';

  let animation_id = $pagination.params.asset_id || null;
  let possible_fps = [4,8,12,24];

  let frames = [],
  fps = 12;

  let frame_focus = 0;

  let fetch_asset_data_promise = false;

  onMount(async()=>{
    if(animation_id != null) {
      fetch_asset_data_promise = fetchAssetData();
    };
  });

  async function fetchAssetData(){
    await new Promise((res, reject)=>{
      setTimeout(()=>{
        res();
      }, 1000);
    });
    let fetch_response = await fetch(`${request_path}/assets/${animation_id}`);
    let asset = await fetch_response.json();
    frames = asset.data.frames;
    fps = asset.data.fps;
  }

  function addFrame(){
    // Ask API to create a new Asset
    // Await response...
    let confirmScanFunc = async function(imageBlob) {
      let formData = new FormData();
      formData.append('picture', imageBlob);
      if(animation_id == null){
        // Create a new animation asset and send new frame
        let upload_response = await fetch(`${request_path}/assets/create/animation`, {
          body: formData,
          method: "post"
        });
        let { asset_id, added_frame } = await upload_response.json();
        animation_id = asset_id;
        frames = [...frames, added_frame];
        return upload_response.ok;
      }else{
        // Add frame to existing animation asset
        let add_frame_response = await fetch(`${request_path}/assets/addframe/animation/${animation_id}`, {
          body: formData,
          method: "put"
        });
        let { added_frame } = await add_frame_response.json();
        frames = [...frames, added_frame];
        return add_frame_response.ok;
      }
    }
    scanning.launch(confirmScanFunc);
  }

  let is_playing = false,
  play_interval = null;

  function togglePlay(){
    if(frames.length <= 1) return;
    is_playing = !is_playing;
    if(is_playing){
      play_interval = setInterval(()=>{
        frame_focus = (frame_focus + 1) % frames.length;
      }, 1000 / fps);
    }else{
      clearInterval(play_interval);
    }
  }

  async function saveState() {
    let save_response = await fetch(`${request_path}/assets/save/animation/${animation_id}`, {
      body: JSON.stringify({
        "frames": frames.map(frame => frame.id),
        "fps": fps
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
      method: "put"
    });
    return save_response.ok;
  }

  async function deleteFrame() {
    let save_response = await fetch(`${request_path}/assets/deleteframe/animation/${animation_id}/${frame_focus}`, {
      method: "delete"
    });
    return save_response.ok;
  }

  let order_changing = false;

  function onOrderChanged(){
    order_changing = true;
    saveState().then(v=>{
      order_changing = false;
    });
  }

  let frame_deletion = false;

  function onDeleteFrame(){
    if(frames.length <= 1) return;
    frames = frames.filter((frame, index) => index !== frame_focus);
    frame_focus = Math.max(frame_focus - 1, 0);
    frame_deletion = true;
    deleteFrame().then(v=>{
      frame_deletion = false;
    });
  }

  function closeAnimator(){
    if( is_saving ) return;
    pagination.setPage("home");
  }


  $ : is_saving = order_changing || frame_deletion;

</script>
{#await fetch_asset_data_promise}
<div out:fade class="fixed w-full h-full bg-white flex-1 flex flex-col items-center justify-center gap-2">
<svg transition:scale xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 animate-spin fill-green-500" viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
</svg>
<h4 class="uppercase text-gray-500">Loading asset ...</h4>
</div>
{:then}
<DefaultBody>
    <DefaultHeader
    on:goBack={closeAnimator}
    save_state={is_saving?"saving":"saved"}
    title="Flip book" />
    <div class="flex-1 tile-bg rounded-xl">
      {#if frames.length > 0}
        <div
        class="w-full h-full bg-contain bg-center bg-no-repeat"
        style="background-image:url({request_path}/{frames[frame_focus].path});">
        </div>
      {/if}
    </div>
    <footer>
      <Timeline
      on:addFrame={addFrame}
      frames={frames}
      bind:frame_focus
      disabled={is_playing}
      on:orderchange={onOrderChanged}
      />
      <div class="flex items-center justify-center gap-4">
      <button
      on:click={onDeleteFrame}
      disabled={is_playing || frames.length <= 1}
      class="
      group disabled:bg-gray-300
      bg-orange-500/50 p-4 rounded-xl">
        <svg class="w-6 h-6 fill-orange-500 group-disabled:fill-gray-500" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M7.82857 6.902V5.13368C7.82857 2.29843 10.1311 0 12.9714 0H19.0667C21.907 0 24.2095 2.29843 24.2095 5.13368V6.902H25.7143C26.9767 6.902 28 7.92353 28 9.18364V12.6061H4V9.18364C4 7.92353 5.02335 6.902 6.28571 6.902H7.82857ZM11.2571 5.13368C11.2571 4.1886 12.0247 3.42245 12.9714 3.42245H19.0667C20.0134 3.42245 20.781 4.18859 20.781 5.13368V6.902H11.2571V5.13368Z" />
          <path d="M4 14.8877L6.55962 30.0964C6.74456 31.1952 7.69752 32 8.81375 32H23.1863C24.3025 32 25.2554 31.1952 25.4404 30.0964L28 14.8877H4Z"/>
        </svg>
      </button>
      <button
      on:click={togglePlay}
      class="w-2/4 flex justify-center bg-indigo-500/50 px-8 py-6 rounded-full">
        <svg class="w-10 h-10 fill-indigo-500" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {#if is_playing}
            <rect x="3" y="2" width="10" height="28" rx="2"/>
            <rect x="19" y="2" width="10" height="28" rx="2"/>
          {:else}
            <path d="M27.3907 14.9023L4.88512 1.1817C4.05377 0.67486 3 1.28844 3 2.27936V29.7206C3 30.7116 4.05376 31.3251 4.88512 30.8183L27.3907 17.0977C28.2031 16.6024 28.2031 15.3976 27.3907 14.9023Z" />
          {/if}
        </svg>
      </button>
      <select
      disabled={is_playing}
      bind:value={fps}
      id="fps-selection"
      class="p-4">
        {#each possible_fps as pos_fps}
          <option value={pos_fps}>{pos_fps} FPS</option>
        {/each}
      </select>
      </div>
    </footer>
</DefaultBody>
{/await}

<style>

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
  }

</style>
