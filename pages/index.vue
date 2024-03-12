<script setup>
useHead({
  link: [
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    },
  ],
});

const transactions = ref([]);
const data = ref([]);
const prices = ref([]);
const total_investedValue = ref(0);
const totalCurrentValue = ref(0);

const totalSell = computed(() => {
  return transactions.value
    .filter((x) => x.type === "sell")
    .reduce((acc, x) => acc + round(x.price * x.amount - x.fee), 0);
});

function round(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

async function getCriptoInfo() {
  const response = await $fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${transactions.value
      .map((x) => x.currency)
      .join(",")}&tsyms=USD`,
    {
      method: "GET",
    }
  );
  prices.value = response;
}

async function groupData() {
  const summary = transactions.value.reduce((acc, curr) => {
    const {
      currency,
      type,
      amount,
      price,
      from_currency,
      total_invested,
      total_recovery,
    } = curr;
    const factor = type === "buy" || type === "transfer_in" ? 1 : -1;

    const baseCurrency = from_currency ? from_currency : currency; // Use from_currency if present

    const existingItem = acc.find((item) => item.currencyName === baseCurrency);
    const priceBuy = type == "buy" ? price : 0;
    const quantityBuy = type == "buy" ? 1 : 0;
    const priceSell = type == "sell" ? price : 0;
    const quantitySell = type == "sell" ? 1 : 0;

    if (existingItem) {
      existingItem.quantity += factor * amount;
      existingItem.investedValue += total_invested;
      existingItem.recoveryValue += total_recovery;
      existingItem.quantityBuy += quantityBuy;
      existingItem.amountBuy += priceBuy;
      existingItem.quantitySell += quantitySell;
      existingItem.amountSell += priceSell;
    } else {
      acc.push({
        currencyName: baseCurrency,
        quantity: factor * amount,
        investedValue: total_invested,
        recoveryValue: total_recovery,
        currentValue: 0,
        gainLoss: 0,
        portfolioPercentage: 0,
        quantityBuy: quantityBuy,
        amountBuy: priceBuy,
        quantitySell: quantitySell,
        amountSell: priceSell,
      });
    }

    return acc;
  }, []);

  summary.forEach((item) => {
    item.currentPrice = prices.value[item.currencyName].USD;
    item.currentValue = item.quantity * item.currentPrice; // Simulating current value
    item.gainLoss = item.currentValue + item.recoveryValue - item.investedValue;
  });

  total_investedValue.value = summary.reduce((acc, item) => {
    return acc + item.investedValue;
  }, 0);
  totalCurrentValue.value = summary.reduce((acc, item) => {
    return acc + item.currentValue;
  }, 0);

  summary.forEach((item) => {
    item.portfolioPercentage =
      (item.investedValue / total_investedValue.value) * 100;
  });

  data.value = summary;
}

onMounted(async () => {
  const response = await queryContent("/transactions").findOne();
  transactions.value = response.body;
  await getCriptoInfo();
  await groupData();
});
</script>

<template>
  <div class="container pt-5">
    <h2>Portafolio Cripto</h2>
    <table class="table table-striped table-bordered">
      <tr>
        <td scope="col" class="text-bg-primary text-center p-2">Ticker</td>
        <td scope="col" class="text-bg-primary text-center">Current Price</td>
        <td scope="col" class="text-bg-primary text-center">Total assets</td>
        <td scope="col" class="text-bg-primary text-center">Invested value</td>
        <td scope="col" class="text-bg-primary text-center">Current value</td>
        <td scope="col" class="text-bg-primary text-center">G/L</td>
        <td scope="col" class="text-bg-primary text-center">% Porfolio</td>
        <td scope="col" class="text-bg-primary text-center">Av Buy</td>
        <td scope="col" class="text-bg-primary text-center">Total Buy</td>
        <td scope="col" class="text-bg-primary text-center">Av Sell</td>
        <td scope="col" class="text-bg-primary text-center">Total Sell</td>
      </tr>
      <tr v-for="(item, index) in data" :key="index">
        <td class="text-center p-2">{{ item.currencyName }}</td>
        <td class="text-center">{{ item.currentPrice }}</td>
        <td class="text-center">{{ round(item.quantity) }}</td>
        <td class="text-center">{{ round(item.investedValue) }}</td>
        <td class="text-center">{{ round(item.currentValue) }}</td>
        <td class="text-center">{{ round(item.gainLoss) }}</td>
        <td class="text-center">{{ round(item.portfolioPercentage) }}%</td>
        <td class="text-center">
          {{ item.quantityBuy ? round(item.amountBuy / item.quantityBuy) : 0 }}
        </td>
        <td class="text-center">{{ item.quantityBuy }}</td>
        <td class="text-center">
          {{
            item.quantitySell ? round(item.amountSell / item.quantitySell) : 0
          }}
        </td>
        <td class="text-center">{{ item.quantitySell }}</td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td class="p-2 text-center">
          <strong>{{ round(total_investedValue) }} USD</strong>
        </td>
        <td class="p-2 text-center">
          <strong>{{ round(totalCurrentValue) }} USD</strong>
        </td>
        <td class="p-2 text-center">
          <strong
            >{{
              round(totalSell + totalCurrentValue - total_investedValue)
            }}
            USD</strong
          >
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </table>
    <h2>Recovery Money</h2>
    {{ totalSell }} USD
  </div>
</template>
