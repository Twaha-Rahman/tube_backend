async function fetcher(api, link) {
  const fetchedData = await api(link);
  const parsedData = fetchedData.json();
  return parsedData;
}

module.exports = fetcher;
