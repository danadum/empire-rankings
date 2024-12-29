<template>
    <div>
        <div :id="`toggle-switch-${name}`" class="size-full p-0.5 flex bg-neutral-100 rounded-lg dark:bg-neutral-700">
            <label :for="`toggle-switch-${name}-off`" class="grow relative py-2 px-3">
                <span class="min-w-8 size-full flex items-center justify-center relative z-10 text-sm cursor-pointer">
                    <div v-if="choices[0].icon" class="bg-current" :style="`mask-image:url(${choices[0].icon})`">
                        <img :src="choices[0].icon" alt="Choice 1 icon" class="h-4 opacity-0" />
                    </div>
                    <img v-if="choices[0].image" :src="choices[0].image" alt="Choice 1 image" class="h-4" />
                    <span v-if="choices[0].text" class="ms-2">{{ choices[0].text }}</span>
                </span>
                <input
                    :id="`toggle-switch-${name}-off`"
                    :name="`toggle-switch-${name}`"
                    type="radio"
                    class="absolute top-0 end-0 size-full border-transparent bg-transparent bg-none text-transparent rounded-lg cursor-pointer before:absolute before:inset-0 before:size-full before:rounded-lg focus:ring-offset-0 checked:before:bg-white checked:before:shadow-sm checked:bg-none dark:checked:before:bg-neutral-800 focus:ring-blue-500"
                    :checked="!value"
                    @click="change" />
            </label>
            <label :for="`toggle-switch-${name}-off`" class="grow relative py-2 px-3">
                <span class="min-w-8 size-full flex items-center justify-center relative z-10 text-sm cursor-pointer">
                    <div v-if="choices[1].icon" class="bg-current" :style="`mask-image:url(${choices[1].icon})`">
                        <img :src="choices[1].icon" alt="Choice 2 icon" class="h-4 opacity-0" />
                    </div>
                    <img v-if="choices[1].image" :src="choices[1].image" alt="Choice 2 image" class="h-4" />
                    <span v-if="choices[1].text" class="ms-2">{{ choices[1].text }}</span>
                </span>
                <input
                    :id="`toggle-switch-${name}-off`"
                    :name="`toggle-switch-${name}`"
                    type="radio"
                    class="absolute top-0 end-0 size-full border-transparent bg-transparent bg-none text-transparent rounded-lg cursor-pointer before:absolute before:inset-0 before:size-full before:rounded-lg focus:ring-offset-0 checked:before:bg-white checked:before:shadow-sm checked:bg-none dark:checked:before:bg-neutral-800 focus:ring-blue-500"
                    :checked="value"
                    @click="change" />
            </label>
        </div>
    </div>
</template>

<script>
    export default {
        name: "SelectInput",
        props: {
            name: {
                type: String,
                required: true,
            },
            choices: {
                type: Array,
                required: true,
            },
            value: {
                type: Boolean,
                required: false,
            },
            change: {
                type: Function,
                required: false,
            },
        },
    };
</script>

<style scoped></style>
