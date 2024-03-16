<script setup>
import Portfolio from "~/components/Portfolio.vue";

const tabItems = [
  {
    key: "cripto",
    label: "Criptocurrencies",
  },
  {
    key: "market-stocks",
    label: "Stock Market",
  },
  {
    key: "gold",
    label: "Gold",
  },
  {
    key: "properties",
    label: "Properties",
  },
];

const criptoPrices = ref({});
const stockPrices = ref({});
const metalsPrices = ref();

const criptoData = ref({});
const criptoDataSummary = ref({});

const stockData = ref({});
const stockDataSummary = ref({});

const goldData = ref({});
const goldDataSummary = ref({});

const propertiesData = ref({});
const propertiesDataSummary = ref({});

const totalInvested = computed(() => {
  return round(
    criptoDataSummary.value.totalInvestedValue +
      stockDataSummary.value.totalInvestedValue +
      goldDataSummary.value.totalInvestedValue +
      propertiesDataSummary.value.totalInvestedValue
  );
});

const totalCurrent = computed(() => {
  return round(
    criptoDataSummary.value.totalCurrentValue +
      stockDataSummary.value.totalCurrentValue +
      goldDataSummary.value.totalCurrentValue +
      propertiesDataSummary.value.totalCurrentValue
  );
});

function round(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

async function getCriptoInfo() {
  const response = await $fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${criptoData.value.transactions
      .map((x) => x.currency)
      .join(",")}&tsyms=USD`,
    {
      method: "GET",
    }
  );
  criptoPrices.value = response;
}

async function getStockInfo() {
  const values = stockData.value.transactions.map((x) => x.currency);
  const response = await $fetch(
    "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes",
    {
      method: "GET",
      params: {
        region: "US",
        symbols: values.join(","),
      },
      headers: {
        "X-RapidAPI-Key": "112bec3e7fmsh0032707303471dcp162303jsnf3e4be0bd630",
        "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
      },
    }
  );
  if (response.quoteResponse.error) {
    stockPrices.value = values.reduce((acc, it) => {
      acc[it.symbol] = -1;
      return acc;
    }, {});
  } else {
    stockPrices.value = response.quoteResponse.result
      .filter((x) => values.includes(x.symbol))
      .reduce((acc, it) => {
        acc[it.symbol] = it.ask;
        return acc;
      }, {});
  }
}

async function getGoldInfo() {
  const response = await $fetch(`https://api.gold-api.com/price/XAU`, {
    method: "GET",
  });
  metalsPrices.value = {
    XAU: response.price,
  };
}

function groupData(transactionData, currentPriceFn) {
  const summary = transactionData.reduce((acc, curr) => {
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
    item.currentPrice = currentPriceFn(item.currencyName, item.amountBuy);
    item.currentValue = item.quantity * item.currentPrice;
    item.gainLoss = item.currentValue + item.recoveryValue - item.investedValue;
  });

  const totalInvestedValue = summary.reduce((acc, item) => {
    return acc + item.investedValue;
  }, 0);
  const totalCurrentValue = summary.reduce((acc, item) => {
    return acc + item.currentValue;
  }, 0);

  summary.forEach((item) => {
    item.portfolioPercentage = (item.investedValue / totalInvestedValue) * 100;
  });

  return {
    summary,
    totalInvestedValue: round(totalInvestedValue),
    totalCurrentValue: round(totalCurrentValue),
    totalSell: transactionData
      .filter((x) => x.type === "sell")
      .reduce((acc, x) => acc + round(x.price * x.amount - x.fee), 0),
  };
}

onMounted(async () => {
  criptoData.value = await queryContent("/cripto").findOne();
  stockData.value = await queryContent("/stock").findOne();
  goldData.value = await queryContent("/gold").findOne();
  propertiesData.value = await queryContent("/properties").findOne();
  await getCriptoInfo();
  await getStockInfo();
  await getGoldInfo();
  criptoDataSummary.value = groupData(
    criptoData.value.transactions,
    (symbol) => criptoPrices.value[symbol].USD
  );
  stockDataSummary.value = groupData(
    stockData.value.transactions,
    (symbol) => stockPrices.value[symbol]
  );
  goldDataSummary.value = groupData(
    goldData.value.transactions,
    (symbol) => metalsPrices.value[symbol] / 31.10
  );
  propertiesDataSummary.value = groupData(
    propertiesData.value.transactions,
    (symbol, currentPrice) => currentPrice
  );
});
</script>

<template>
  <div class="p-10">
    <div class="mb-5 grid grid-cols-3 gap-2">
      <SummaryCard title="Total Invested" :amount="totalInvested" />
      <SummaryCard title="Total Current" :amount="totalCurrent" />
      <SummaryCard
        title="Recovery Invested"
        :amount="round(criptoDataSummary.totalSell)"
      />
    </div>
    <UTabs :items="tabItems">
      <template #item="{ item }">
        <div v-if="item.key === 'cripto'">
          <Portfolio
            :summaryData="criptoDataSummary"
            :transactionsColumns="criptoData.columns"
            :transactionsData="criptoData.transactions"
          />
        </div>
        <div v-if="item.key === 'market-stocks'">
          <Portfolio
            :summaryData="stockDataSummary"
            :transactionsColumns="stockData.columns"
            :transactionsData="stockData.transactions"
          />
        </div>
        <div v-if="item.key === 'gold'">
          <Portfolio
            :summaryData="goldDataSummary"
            :transactionsColumns="goldData.columns"
            :transactionsData="goldData.transactions"
          />
        </div>
        <div v-if="item.key === 'properties'">
          <Portfolio
            :summaryData="propertiesDataSummary"
            :transactionsColumns="propertiesData.columns"
            :transactionsData="propertiesData.transactions"
          />
        </div>
      </template>
    </UTabs>
  </div>
</template>
