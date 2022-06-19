<script>
  import DefaultHeader from "$lib/components/default_header.svelte";
  import DefaultBody from "$lib/components/default_body.svelte";
  import LoadingScreen from "$lib/components/loading_screen.svelte";
  import { onMount } from "svelte";
  import { scanning, pagination } from '$lib/store.js';

  import ModelSelection from "./components/model_selection.svelte";
  import ModelViewer from "./components/model_viewer.svelte";
  import { fish_icon, car_icon } from "./icons.js";
  import { vehicle_model } from "./models.js";

  import request_path from "$lib/request_path.js";

  vehicle_model.parts = partToRatio(vehicle_model);

  function partToRatio(model) {
    return model.parts.map(part => {
      part.ratio = part.w / part.h;
      part.x /= model.sheet_size.w;
      part.w /= model.sheet_size.w;
      part.y /= model.sheet_size.h;
      part.h /= model.sheet_size.h;
      return part;
    });
  }

  let models = [
    {name:"vehicle", icon:car_icon, model: vehicle_model },
    {name:"fish", icon:fish_icon, model: vehicle_model }
  ];

  let selection_id = 0;
  let model = {};
  let on_server_model = {};
  let model_texture = null;
  let parts_texture = [];
  let document_id = $pagination.params.asset_id || null;

  let fetch_asset_data_promise = false;

  onMount(async()=>{
    if(document_id != null) {
      fetch_asset_data_promise = fetchAssetData(document_id);
    };
  });

  async function fetchAssetData(document_id){
    await new Promise((res, reject)=>{
      setTimeout(()=>{
        res();
      }, 1000);
    });
    let fetch_response = await fetch(`${request_path}/assets/${document_id}`);
    let asset = await fetch_response.json();
    model_texture = await imgFromPath(`${request_path}/${asset.data.texture.path}`);
    model = asset.data.model_data;
    parts_texture = cutParts(model, model_texture);
    on_server_model = JSON.parse(JSON.stringify(model));
  }

  async function requestScan() {
    // models[selection_id]
    let scan_blob = await new Promise((res, rej) => {
      let confirmScanFunc = async function(imageBlob) {
        res(imageBlob);
        return true;
      }
      scanning.launch(confirmScanFunc);
    });
    // If the scan failed / was cancel
    // Don't to anything
    if(!scan_blob) return;

    // initialize a new model!

    model_texture = await imgFromBlob(scan_blob);
    model = JSON.parse(JSON.stringify(models[selection_id].model));
    parts_texture = cutParts(model, model_texture);
  }
  function cutParts(model, texture) {
    let canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d");
    let texture_width = texture.width,
      texture_height = texture.height;
    return model.parts.map(part => {
      let {
        x,
        y,
        w,
        h
      } = part;
      let tw = w * texture_width,
        th = h * texture_height;
      canvas.width = tw;
      canvas.height = th;
      ctx.drawImage(texture, x * texture_width, y * texture_height, tw, th, 0, 0, tw, th);
      return canvas.toDataURL();
    });
  }

  function imgFromBlob(blob){
    return new Promise((res, rej)=>{
      let img = new Image();
      img.onload = function(){
        res(img);
      }
      img.src = URL.createObjectURL(blob);
    });
  }

  function imgFromPath(img_path){
    return new Promise((res, rej)=>{
      let img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function(){
        res(img);
      }
      img.src = img_path;
    });
  }

  async function requestSave(){
    saving = true;
    if(document_id == null){
      await saveTemplate();
    }else{
      // Update template asset
    }
    saving = false;
  }

  async function saveTemplate(){
    let imageBlob = await fetch(model_texture.src).then(r => r.blob());
    let formData = new FormData();
    formData.append('picture', imageBlob);
    formData.append('model_data', JSON.stringify(model));
    let upload_response = await fetch(`${request_path}/assets/create/template`, {
      body: formData,
      method: "post"
    });
    let { asset_id } = await upload_response.json();
    document_id = asset_id;
    on_server_model = JSON.parse(JSON.stringify(model));
  }

  function closeTemplateEditor() {
    if( saving ) return;
    pagination.setPage("home");
  }

  let saving = false;
  let save_state = "inactive";

  $: model_differ = JSON.stringify(model) != JSON.stringify(on_server_model);
  $: is_unsaved = document_id == null || model_differ;
  $: model_length = Object.keys(model).length;

  $:{
    if(model_length == 0){
      save_state = "inactive";
    }else if(saving){
      saving = "saving";
    }else{
      save_state = (is_unsaved)?"unsaved":"saved";
    }
  };

</script>
{#await fetch_asset_data_promise}
  <LoadingScreen>Loading asset ...</LoadingScreen>
{:then}
<DefaultBody>
  <DefaultHeader
  on:goBack={closeTemplateEditor}
  on:requestSave={requestSave}
  save_state={save_state}
  title="Template Editor" />
  {#if model_texture == null}
    <ModelSelection bind:selection_id {models} on:confirm={requestScan} />
    {:else}
    <ModelViewer bind:model={model} bind:textures={parts_texture} />
  {/if}
</DefaultBody>
{/await}
