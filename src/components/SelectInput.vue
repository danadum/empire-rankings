<template>
    <div>
        <div class="relative">
            <select
                :value="value"
                @change="change"
                class="peer p-4 pe-9 w-full bg-gray-100 border-transparent rounded-lg text-sm focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2">
                <option v-for="option in options" :value="option.value" :key="option.key">
                    {{ option.text }}
                </option>
            </select>
            <label
                v-if="title"
                class="absolute top-0 start-0 p-4 h-full truncate pointer-events-none border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 text-neutral-400 dark:text-neutral-500">
                {{ title }}
            </label>
        </div>
    </div>
</template>

<script>
    export default {
        name: "SelectInput",
        props: {
            title: {
                type: String,
                required: false,
            },
            options: {
                type: Array,
                required: true,
            },
            value: {
                type: String,
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
