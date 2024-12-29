<template>
    <div>
        <div class="loader relative size-full rotate-45">
            <div
                v-for="index in 7"
                :key="index"
                :style="`animation-delay: calc(-${index}0s/7)`"
                class="loader-square absolute top-0 left-0 size-[30%] bg-current"></div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "LoaderSquare",
    };
</script>

<style scoped>
    @keyframes square-animation {
        0% {
            left: 0;
            top: 0;
        }

        10.5% {
            left: 0;
            top: 0;
        }

        12.5% {
            left: calc(100% / 3);
            top: 0;
        }

        23% {
            left: calc(100% / 3);
            top: 0;
        }

        25% {
            left: calc(200% / 3);
            top: 0;
        }

        35.5% {
            left: calc(200% / 3);
            top: 0;
        }

        37.5% {
            left: calc(200% / 3);
            top: calc(100% / 3);
        }

        48% {
            left: calc(200% / 3);
            top: calc(100% / 3);
        }

        50% {
            left: calc(100% / 3);
            top: calc(100% / 3);
        }

        60.5% {
            left: calc(100% / 3);
            top: calc(100% / 3);
        }

        62.5% {
            left: calc(100% / 3);
            top: calc(200% / 3);
        }

        73% {
            left: calc(100% / 3);
            top: calc(200% / 3);
        }

        75% {
            left: 0;
            top: calc(200% / 3);
        }

        85.5% {
            left: 0;
            top: calc(200% / 3);
        }

        87.5% {
            left: 0;
            top: calc(100% / 3);
        }

        98% {
            left: 0;
            top: calc(100% / 3);
        }

        100% {
            left: 0;
            top: 0;
        }
    }

    .loader-square {
        animation: square-animation 10s ease-in-out infinite both;
    }
</style>
