<script>
  let colors = ["#FF4C11", "#FFD233", "#FEBFFF", "#09B864"];
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function finished(){
    dispatch('animationend');
  }
  export function play(){
    isPlaying = true;
  }
  let isPlaying = false;
</script>

<svg class:playWink={isPlaying} class="jump w-48" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 170 170" fill="none">
<path class="headshake" on:animationend={finished} fill={colors[Math.floor(Math.random()*colors.length)]} d="M73.7164 21.3226C78.5108 12.2626 91.4892 12.2626 96.2836 21.3226V21.3226C99.5096 27.4188 107.048 29.8242 113.241 26.7878V26.7878C122.406 22.2942 132.96 29.8609 131.486 39.9615V39.9615C130.492 46.777 135.156 53.1479 141.945 54.3074V54.3074C152.008 56.0259 156.073 68.3544 148.928 75.6454V75.6454C144.107 80.5643 144.107 88.4357 148.928 93.3546V93.3546C156.073 100.646 152.008 112.974 141.945 114.693V114.693C135.156 115.852 130.492 122.223 131.486 129.039V129.039C132.96 139.139 122.406 146.706 113.241 142.212V142.212C107.048 139.176 99.5096 141.581 96.2836 147.677V147.677C91.4892 156.737 78.5108 156.737 73.7164 147.677V147.677C70.4904 141.581 62.9522 139.176 56.7593 142.212V142.212C47.5942 146.706 37.0403 139.139 38.514 129.039V129.039C39.5083 122.223 34.8444 115.852 28.055 114.693V114.693C17.9923 112.974 13.9273 100.646 21.0724 93.3546V93.3546C25.893 88.4357 25.893 80.5643 21.0724 75.6454V75.6454C13.9273 68.3544 17.9923 56.0259 28.055 54.3074V54.3074C34.8444 53.1479 39.5083 46.777 38.514 39.9615V39.9615C37.0403 29.8609 47.5942 22.2942 56.7593 26.7878V26.7878C62.9522 29.8242 70.4904 27.4188 73.7164 21.3226V21.3226Z"/>
<g class="shake">
<circle cx="52.5" cy="84.5" r="7.5" fill="black"/>
<circle class="openEye" cx="117.5" cy="84.5" r="7.5" fill="black"/>
<path class="closedEye" d="M106 88.5V88.5C112.351 82.1487 122.649 82.1487 129 88.5V88.5" stroke="black" stroke-width="9"/>
<path d="M70 104L73.6863 107.686C79.9347 113.935 90.0653 113.935 96.3137 107.686L100 104" stroke="black" stroke-width="7"/>
</g>

</svg>

<style>
.jump{
  animation: jump .4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
}

@keyframes jump {
  0%{
    opacity: 0;
    transform: scale(.6);
  }

  100%{
    transform: scale(1);
  }
}

.playWink .shake{
  transform-origin: center;
  animation: shake .6s .3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.playWink .headshake{
  transform-origin: center;
  animation: shake .8s .3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.playWink .openEye{
  animation: openWink .6s .3s;
}

.playWink .closedEye{
  animation: closeWink .6s .3s;
  visibility: hidden;
}

.closedEye{
  visibility: hidden;
}

@keyframes shake {
  0%{
    transform: rotate(0deg);
  }
  20%{
    transform: rotate(20deg);
  }
  30%{
    transform: rotate(20deg);
  }
  100%{
    transform: rotate(0deg);
  }
}

@keyframes openWink {
  10%{
    visibility: hidden;
  }
  40%{
    visibility: hidden;
  }
}

@keyframes closeWink {
  10%{
    visibility: hidden;
  }
  20%{
    visibility: visible;
  }
  40%{
    visibility: hidden;
  }
}


</style>
