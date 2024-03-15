<script setup>
defineProps({
  summaryData: {
    type: Array
  },
  transactionsColumns: {
    type: Array
  },
  transactionsData: {
    type: Array
  }
});

const summaryColumns = [
  {
    key: "currencyName",
    label: "Ticker",
  },
  {
    key: "currentPrice",
    label: "Price",
  },
  {
    key: "quantity",
    label: "Total assets",
  },
  {
    key: "investedValue",
    label: "Invested Value",
  },
  {
    key: "currentValue",
    label: "Current value",
  },
  {
    key: "gainLoss",
    label: "Gain/Loss",
  },
  {
    key: "portfolioPercentage",
    label: "% Porfolio",
  },
  {
    key: "averageBuy",
    label: "Av Buy",
  },
  {
    key: "quantityBuy",
    label: "Total Buy",
  },
  {
    key: "averageSell",
    label: "Av Sell",
  },
  {
    key: "quantitySell",
    label: "Total Sell",
  },
];

function round(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

</script>

<template>
  <h2 class="text-lg font-medium mb-2">Summary</h2>
  <div class="grid grid-cols-3 gap-2 mb-5">
    <SummaryCard
      title="Total Invested Value"
      :amount="summaryData.totalInvestedValue"
    />
    <SummaryCard
      title="Total Current Value"
      :amount="summaryData.totalCurrentValue"
    />
    <SummaryCard
      title="Gain/Loss"
      :amount="round(summaryData.totalSell + summaryData.totalCurrentValue - summaryData.totalInvestedValue)"
    />
  </div>
  <UTable
    :rows="summaryData.summary"
    :columns="summaryColumns"
    :ui="{ td: { base: 'text-center' }, th: { base: 'text-center' } }"
  >
    <template #quantity-data="{ row }">
      <span>{{ round(row.quantity) }}</span>
    </template>
    <template #investedValue-data="{ row }">
      <span>{{ round(row.investedValue) }}</span>
    </template>
    <template #currentValue-data="{ row }">
      <span>{{ round(row.currentValue) }}</span>
    </template>
    <template #gainLoss-data="{ row }">
      <span
        class="font-medium"
        :class="{
          'text-green-500': row.gainLoss > 0,
          'text-red-500': row.gainLoss < 0,
        }"
        >{{ round(row.gainLoss) }}</span
      >
    </template>
    <template #portfolioPercentage-data="{ row }">
      <span>{{ round(row.portfolioPercentage) }}</span>
    </template>
    <template #averageBuy-data="{ row }">
      <span>{{
        row.quantityBuy ? round(row.amountBuy / row.quantityBuy) : 0
      }}</span>
    </template>
    <template #averageSell-data="{ row }">
      <span>{{
        row.quantitySell ? round(item.quantitySell / row.quantitySell) : 0
      }}</span>
    </template>
  </UTable>
  <h2 class="text-lg font-medium mt-10">Transactions</h2>
  <UTable
    :rows="transactionsData"
    :columns="transactionsColumns"
    :ui="{ td: { base: 'text-center' }, th: { base: 'text-center' } }"
  >
  </UTable>
</template>
