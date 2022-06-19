<script>
  import HomeView from "$lib/views/home/view.svelte";
  import AnimatorView from "$lib/views/animator/view.svelte";
  import TemplateEditorView from "$lib/views/template_editor/view.svelte";
  import ScannerView from "$lib/views/scanner/view.svelte";
  import { fade, fly } from 'svelte/transition';
  import { scanning } from "$lib/store.js";
  import { cvHelper } from "$lib/cvHelper.js";
  import { pagination } from "$lib/store.js";
  import { onMount } from "svelte";
  pagination.setPage("home")

  onMount(() => {
    cvHelper.load();
  });

	const pages = {
	  "home": HomeView,
	  "animator": AnimatorView,
	  "template_editor": TemplateEditorView,
	};

</script>

<svelte:head>
	<title>PWK Helper</title>
</svelte:head>

{#if $scanning != null}
  <ScannerView/>
{/if}
{#key $pagination}
  <div out:fade={{duration:100}} in:fly="{{y:-100, delay:200}}" class="top-0 left-0 absolute w-full h-full bg-white">
    <svelte:component this={pages[$pagination.path]}/>
  </div>
{/key}
