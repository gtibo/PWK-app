<script>
  import { pagination } from "$lib/store.js";
  import { fade } from 'svelte/transition';
  import SmileyFace from "./components/smiley_face.svelte";

  function launch(){
    pagination.setPage("home")
	}

	function playAnimation(){
		jingle.play();
		playFace();
	}

	let jingle, playFace;
</script>


<audio preload bind:this={jingle} src="./jingle.mp3"></audio>

<div
transition:fade
class="flex flex-col items-center justify-center h-full space-y-10"
on:click={playAnimation}
>
	<SmileyFace bind:play={playFace} on:animationend={launch}/>
	<h1 class="text-2xl font-light">PWK <span class="font-bold f">Helper</span></h1>
</div>
