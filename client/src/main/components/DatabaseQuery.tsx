import { Input, message, Pagination, Skeleton } from "antd";
import { useEffect, useState } from "react";
import statisticsApi from "../api/statistics.api";
import { getQueryParameter, setQueryParameter } from "../util/query.param.util";
import "./DatabaseQuery.css";
import StatisticsTable from "./StatisticsTable";

const SQL_QUERY = "sqlQuery";

interface ReplaceItem {
  key: string;
  value: string;
}

function DatabaseQuery() {
  const [query, setQuery] = useState(getQueryParameter(SQL_QUERY) || "");
  const [queryResults, setQueryResults] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [noResult, setNoResult] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [lastSearchedQuery, setLastSearchedQuery] = useState<string>();
  const [replaceList, setReplaceList] = useState<ReplaceItem[]>([]);
  const [loading, setLoading] = useState(false);

  // We allow common replacement with the form :ALL_UPPER
  useEffect(() => {
    // Get all strings matchin :A-Z in the query
    // This is a bit common SQL, I think
    let toReplace = query.matchAll(/:[A-Z_]+/g);
    let keys = new Set<string>();
    while (true) {
      let item = toReplace.next();
      if (!item.value) {
        break;
      }
      keys.add(item.value[0]);
    }
    let sortedKeys = Array.from(keys).sort();
    setReplaceList((oldList) =>
      sortedKeys.map((key) => {
        let value = oldList.find((it) => it.key === key)?.value || "";
        return { key, value };
      })
    );
  }, [query]);

  const handleSubmit = (page: number, pageSize = 0) => {
    // Avoid fetch in the first render
    if (!query) {
      return;
    }

    setQueryParameter(SQL_QUERY, query);

    // Resets page if it's a new query
    if (query !== lastSearchedQuery) {
      page = 1;
      setPage(1);
    }
    setLastSearchedQuery(query);

    let finalQuery = "" + query;
    replaceList.forEach(
      (replaceItem) =>
        (finalQuery = finalQuery.replaceAll(replaceItem.key, replaceItem.value))
    );

    setLoading(true);
    statisticsApi
      .queryDatabase(finalQuery, page - 1, pageSize)
      .then((response) => {
        let content = response.data.content;
        let headers = response.data.headers;

        setNoResult(content.length === 0);
        setHeaders(headers);
        setQueryResults(content);
        setTotalElements(response.data.totalElements);
      })
      .catch((e) => message.error(e.response?.data?.message || "Error"))
      .finally(() => setLoading(false));
  };

  const handlePaginationChange = (newPage: number, newSize?: number) => {
    if (newSize !== pageSize) {
      newPage = 1;
    }
    setPage(newPage);
    setPageSize((oldSize) => newSize || oldSize);

    handleSubmit(newPage, newSize);
  };

  const handleReplaceChange = (value: string, key: string) => {
    // We replace just the current value
    setReplaceList((oldList) =>
      oldList.map((it) => (it.key === key ? { key, value } : it))
    );
  };

  return (
    <div className="container">
      <h1 className="page-title">Database Query</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(page, pageSize);
        }}
      >
        <div className="form-group">
          <textarea
            className="form-control my-3 shadow"
            onChange={(evt) => setQuery(evt.target.value)}
            value={query}
            placeholder="Type your query here"
            rows={10}
            id="query-input"
          />
          {replaceList.map((replaceItem) => (
            <Input
              required
              className="replace-item"
              key={replaceItem.key}
              // Substring for removing the :
              addonBefore={replaceItem.key.substring(1)}
              onChange={(evt) =>
                handleReplaceChange(evt.target.value, replaceItem.key)
              }
            />
          ))}
          <div className="text-center">
            <button
              className="btn btn-primary btn-lg"
              disabled={!query}
              title={!query ? "You need to provide an SQL query" : ""}
            >
              Submit
            </button>
          </div>
        </div>
      </form>
      {noResult && <div className="alert alert-info">No results to show</div>}

      {totalElements > 0 && (
        <div className="my-3 text-center">
          <Pagination
            defaultPageSize={pageSize}
            current={page}
            total={totalElements}
            onChange={handlePaginationChange}
          />
        </div>
      )}
      {loading && <Skeleton active />}
      {queryResults.length > 0 && !loading && (
        <StatisticsTable
          headers={headers}
          content={queryResults}
          page={page}
          pageSize={pageSize}
          allowInnerHTML={false}
        />
      )}
    </div>
  );
}

export default DatabaseQuery;
