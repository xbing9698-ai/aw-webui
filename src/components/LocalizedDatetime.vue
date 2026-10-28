<template lang="pug">
datetime-input(
  v-bind="$attrs"
  v-on="$listeners"
  :key="$i18n.locale"
  :phrases="{ cancel: $t('common.cancel'), ok: $t('common.confirm') }"
)
</template>

<script lang="ts">
import { Datetime } from 'vue-datetime';

export default {
  name: 'LocalizedDatetime',
  components: { DatetimeInput: Datetime },
  inheritAttrs: false,
};
</script>
