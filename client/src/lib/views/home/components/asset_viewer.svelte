<script>
  import AssetBox from "./asset_box.svelte";
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
  import { scanning, pagination } from '$lib/store.js';
  import request_path from '$lib/request_path.js';
  
  import { onMount } from "svelte";

  let fetch_promise = null,
    asset_list = [];

  onMount(() => {
    fetch_promise = getAssets();
  });

  async function getAssets() {
    const get_res = await fetch(`${request_path}/assets/all`);
    if (!get_res.ok) return;
    asset_list = await get_res.json();
  }

  async function deleteAsset(asset_id) {
    let delete_res = await fetch(`${request_path}/assets/delete/${asset_id}`, {
      method: "DELETE"
    });
    if (!delete_res.ok) return;
    asset_list = asset_list.filter(asset => asset.id !== asset_id);
  }

  function editAsset(asset_type, asset_id) {
    let fn = {
      "drawing": editDrawing,
      "animation": editAnimation,
    };
    fn[asset_type](asset_id);
  }

  async function editDrawing(asset_id){
    let confirmScanFunc = async function(imageBlob) {
      let formData = new FormData();
      formData.append('picture', imageBlob);
      let edit_res = await fetch(`${request_path}/assets/edit/drawing/${asset_id}`, {
        body: formData,
        method: "put"
      });
      return edit_res.ok;
    }
    scanning.launch(confirmScanFunc);
  }

  function editAnimation(asset_id){
    pagination.setPage("animator", {asset_id});
  }


</script>

<div class="px-6 grid gap-4 grid-cols-[repeat(auto-fill,_minmax(16rem,_1fr))]">
  {#await fetch_promise then}
    {#each asset_list as asset, i ( asset.id)}
    <div animate:flip={{duration:400}} transition:fade>
      <AssetBox on:edit={()=>{editAsset(asset.type, asset.id)}} on:delete={()=>{deleteAsset(asset.id)}} {...asset}/>
    </div>
    {/each}
  {/await}
</div>
