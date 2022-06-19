<script>
  import AssetViewer from "./components/asset_viewer.svelte";
  import CreateButton from "./components/create_button.svelte";
</script>

<header class="sticky z-10 top-0
flex items-center justify-between p-4
bg-white/80 backdrop-blur uppercase text-gray-600">World assets</header>
<div class="flex-1">
  <AssetViewer/>
</div>
<footer class="sticky w-full bottom-0 p-4 flex justify-center">
  <CreateButton/>
</footer>
