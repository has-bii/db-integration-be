import React, { useEffect, useRef, useState } from "react";
import Layout from "../../components/Layout";
import axios from "../../../lib/axios";
import Modal from "../../components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function Database() {
  const [databases, setDatabases] = useState([]);
  const [columnsModal, setColumnsModal] = useState(false);

  const [selected, setSelected] = useState({
    dbIndex: "",
    tableIndex: "",
  });

  const [newTable, setNewTable] = useState({
    sourceTable: "",
    targetTable: "",
    filterByCol: { source: "", target: "", type: "PRIMARYKEY" },
    columns: [],
  });

  const [newColumns, setNewColumns] = useState([]);

  const sourceNameRef = useRef();
  const targetNameRef = useRef();

  const [showNewDB, setShowNewDB] = useState(false);
  const [newDB, setNewDB] = useState({
    connection: {
      source: {
        database: "",
        user: "",
        password: "",
        host: "",
        port: "1521",
        dialect: "oracle",
      },
      target: {
        database: "",
        user: "",
        password: "",
        host: "",
        port: "5432",
        dialect: "postgres",
      },
    },
    tables: [],
  });

  const [newTableDB, setNewTableDB] = useState({
    sourceTable: "",
    targetTable: "",
    filterByCol: { source: "", target: "", type: "PRIMARYKEY" },
    columns: [],
  });

  useEffect(() => {
    async function fetchDatabases() {
      await axios
        .get("/config")
        .then((res) => {
          setDatabases(res.data.config);
        })
        .catch((err) => {
          console.error("Error while fetching Database Configuration: ", err);
        });
    }

    fetchDatabases();
  }, []);

  function updateConnectionSourceHandler(e, i, property) {
    const updated = databases.map((database, index) => {
      if (i === index) {
        database.connection.source[property] = e.target.value;

        return database;
      } else return database;
    });

    setDatabases(updated);
  }

  function updateConnectionTargetHandler(e, i, property) {
    const updated = databases.map((database, index) => {
      if (i === index) {
        database.connection.target[property] = e.target.value;

        return database;
      } else return database;
    });

    setDatabases(updated);
  }

  async function pushNewColumn() {
    async function add() {
      if (
        sourceNameRef.current.value.length === 0 ||
        targetNameRef.current.value.length === 0
      )
        alert("Column names must not be empty!");
      else {
        setNewColumns((prev) => [
          ...prev,
          {
            source: sourceNameRef.current.value,
            target: targetNameRef.current.value,
          },
        ]);
      }
    }

    await add();

    sourceNameRef.current.value = "";
    targetNameRef.current.value = "";

    sourceNameRef.current.focus();
  }

  async function addNewTable(index) {
    async function update() {
      setDatabases(
        databases.map((database, i) => {
          if (i === index) {
            database.tables = [...database.tables, newTable];
            return database;
          } else return database;
        })
      );
    }

    await update();

    setNewTable({
      sourceTable: "",
      targetTable: "",
      filterByCol: { source: "", target: "", type: "PRIMARYKEY" },
      columns: [],
    });
  }

  function delTables(dbIndex, tableIndex) {
    setDatabases(
      databases.map((database, index) => {
        if (dbIndex === index) {
          database.tables = database.tables.filter(
            (table, i) => tableIndex !== i
          );

          return database;
        } else return database;
      })
    );
  }

  function updateTableProperty(
    dbIndex,
    tableIndex,
    tableProperty,
    e,
    filteredCol = false
  ) {
    setDatabases(
      databases.map((database, index) => {
        if (dbIndex === index) {
          database.tables = database.tables.map((table, i) => {
            if (tableIndex === i) {
              if (filteredCol) {
                table.filterByCol[tableProperty] = e.target.value;
              } else table[tableProperty] = e.target.value;

              return table;
            } else return table;
          });

          return database;
        } else return database;
      })
    );
  }

  function editAndNewColumnsHandler() {
    if (showNewDB) {
      setNewTableDB({ ...newTableDB, columns: newColumns });
    } else if (selected.dbIndex.length === 0) {
      setNewTable({ ...newTable, columns: newColumns });
    } else {
      setDatabases(
        databases.map((database, index) => {
          if (selected.dbIndex === index) {
            database.tables = database.tables.map((table, i) => {
              if (selected.tableIndex === i) {
                table.columns = newColumns;
              }

              return table;
            });
          }

          return database;
        })
      );

      setSelected({
        dbIndex: "",
        tableIndex: "",
      });
    }

    setNewColumns([]);
    setColumnsModal(false);
  }

  function clearNewDB() {
    setNewDB({
      connection: {
        source: {
          database: "",
          user: "",
          password: "",
          host: "",
          port: "1521",
          dialect: "oracle",
        },
        target: {
          database: "",
          user: "",
          password: "",
          host: "",
          port: "5432",
          dialect: "postgres",
        },
      },
      tables: [],
    });

    setShowNewDB(false);
  }

  function saveNewDB(e) {
    e.preventDefault();

    if (newDB.tables.length === 0) {
      alert("Tables is required!");
    } else {
      setDatabases((prev) => [newDB, ...prev]);

      clearNewDB();
    }
  }

  return (
    <>
      <button
        className={`fixed bottom-10 right-10 p-4 text-white bg-black z-40 transition-all duration-150 ease-in-out rounded-full ${
          showNewDB ? "rotate-45" : "rotate-0"
        }`}
      >
        <div className="px-[2px]">
          <FontAwesomeIcon
            icon={faPlus}
            size="2xl"
            onClick={() => setShowNewDB(!showNewDB)}
          />
        </div>
      </button>
      <Modal show={columnsModal} setShow={setColumnsModal}>
        <div>
          <div className="tables-wrapper">
            <table>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Source</th>
                  <th scope="col">Target</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newColumns.map((col, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{col.source}</td>
                    <td>{col.target}</td>
                    <td>
                      <button
                        className="btn fluid red"
                        onClick={() => {
                          setNewColumns(
                            newColumns.filter((c, i) => i !== index)
                          );
                        }}
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>#</td>
                  <td>
                    <input
                      ref={sourceNameRef}
                      type="text"
                      placeholder="Column name"
                    />
                  </td>
                  <td>
                    <input
                      ref={targetNameRef}
                      type="text"
                      placeholder="Column name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") pushNewColumn();
                      }}
                    />
                  </td>
                  <td>
                    <button className="btn fluid green" onClick={pushNewColumn}>
                      add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <button className="btn gray" onClick={() => setColumnsModal(false)}>
            Cancel
          </button>
          <button className="btn green" onClick={editAndNewColumnsHandler}>
            Save
          </button>
        </div>
      </Modal>
      <Layout>
        <div className="text-2xl font-bold text-slate-950 mb-4">Databases</div>
        {showNewDB && (
          <form onSubmit={saveNewDB} className="database-container new">
            <div className="connection">
              <div className="source">
                <h4 className="heading">Source</h4>
                <div className="connection-wrapper">
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-database">Database</label>
                    <input
                      id="source-database"
                      type="text"
                      placeholder="Database"
                      value={newDB.connection.source.database}
                      onChange={(e) =>
                        setNewDB({
                          ...newDB,
                          connection: {
                            ...newDB.connection,
                            source: {
                              ...newDB.connection.source,
                              database: e.target.value,
                            },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-user">User</label>
                    <input
                      id="source-user"
                      type="text"
                      placeholder="User"
                      value={newDB.connection.source.user}
                      onChange={(e) =>
                        setNewDB({
                          ...newDB,
                          connection: {
                            ...newDB.connection,
                            source: {
                              ...newDB.connection.source,
                              user: e.target.value,
                            },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-password">Password</label>
                    <input
                      id="source-password"
                      type="text"
                      placeholder="Password"
                      value={newDB.connection.source.password}
                      onChange={(e) =>
                        setNewDB({
                          ...newDB,
                          connection: {
                            ...newDB.connection,
                            source: {
                              ...newDB.connection.source,
                              password: e.target.value,
                            },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-host">Host</label>
                    <input
                      id="source-host"
                      type="text"
                      placeholder="Host"
                      value={newDB.connection.source.host}
                      onChange={(e) =>
                        setNewDB({
                          ...newDB,
                          connection: {
                            ...newDB.connection,
                            source: {
                              ...newDB.connection.source,
                              host: e.target.value,
                            },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-port">Port</label>
                    <input
                      id="source-port"
                      type="number"
                      placeholder="Port"
                      value={newDB.connection.source.port}
                      onChange={(e) =>
                        setNewDB({
                          ...newDB,
                          connection: {
                            ...newDB.connection,
                            source: {
                              ...newDB.connection.source,
                              port: e.target.value,
                            },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-dialect">Dialect</label>
                    <input
                      id="source-dialect"
                      type="text"
                      placeholder="Dialect"
                      value={newDB.connection.source.dialect}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="target">
                <h4 className="heading">Target</h4>
                <div className="connection-wrapper">
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-database">Database</label>
                    <input
                      id="target-database"
                      type="text"
                      placeholder="Database"
                      value={newDB.connection.target.database}
                      onChange={(e) =>
                        setNewDB({
                          ...newDB,
                          connection: {
                            ...newDB.connection,
                            target: {
                              ...newDB.connection.target,
                              database: e.target.value,
                            },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-user">User</label>
                    <input
                      id="target-user"
                      type="text"
                      placeholder="User"
                      value={newDB.connection.target.user}
                      onChange={(e) =>
                        setNewDB({
                          ...newDB,
                          connection: {
                            ...newDB.connection,
                            target: {
                              ...newDB.connection.target,
                              user: e.target.value,
                            },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-password">Password</label>
                    <input
                      id="target-password"
                      type="text"
                      placeholder="Password"
                      value={newDB.connection.target.password}
                      onChange={(e) =>
                        setNewDB({
                          ...newDB,
                          connection: {
                            ...newDB.connection,
                            target: {
                              ...newDB.connection.target,
                              password: e.target.value,
                            },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-host">Host</label>
                    <input
                      id="target-host"
                      type="text"
                      placeholder="Host"
                      value={newDB.connection.target.host}
                      onChange={(e) =>
                        setNewDB({
                          ...newDB,
                          connection: {
                            ...newDB.connection,
                            target: {
                              ...newDB.connection.target,
                              host: e.target.value,
                            },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-port">Port</label>
                    <input
                      id="target-port"
                      type="number"
                      placeholder="Port"
                      value={newDB.connection.target.port}
                      onChange={(e) =>
                        setNewDB({
                          ...newDB,
                          connection: {
                            ...newDB.connection,
                            target: {
                              ...newDB.connection.target,
                              port: e.target.value,
                            },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-dialect">Dialect</label>
                    <input
                      id="target-dialect"
                      type="text"
                      placeholder="Dialect"
                      value={newDB.connection.target.dialect}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="tables">
              <h4 className="heading">Tables</h4>
              <div className="tables-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Source Table</th>
                      <th scope="col">Target Table</th>
                      <th scope="col">filtered source col</th>
                      <th scope="col">filtered target col</th>
                      <th scope="col">filtered col type</th>
                      <th scope="col">Columns</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newDB.tables.map((table, i) => (
                      <tr key={i}>
                        <th scope="row" className=" whitespace-nowrap">
                          {i + 1}
                        </th>
                        <td>
                          <input
                            type="text"
                            value={table.sourceTable}
                            onChange={(e) =>
                              updateTableProperty(index, i, "sourceTable", e)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={table.targetTable}
                            onChange={(e) =>
                              updateTableProperty(index, i, "targetTable", e)
                            }
                          />
                        </td>
                        <td>
                          <select
                            value={table.filterByCol.source}
                            onChange={(e) =>
                              updateTableProperty(index, i, "source", e, true)
                            }
                          >
                            {table.columns.map((column, index) => (
                              <option key={index} value={column.source}>
                                {column.source}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={table.filterByCol.target}
                            onChange={(e) =>
                              updateTableProperty(index, i, "target", e, true)
                            }
                          >
                            {table.columns.map((column, index) => (
                              <option key={index} value={column.target}>
                                {column.target}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={table.filterByCol.type}
                            onChange={(e) =>
                              updateTableProperty(index, i, "type", e, true)
                            }
                          >
                            <option value="PRIMARYKEY">PRIMARYKEY</option>
                            <option value="TIMESTAMP">TIMESTAMP</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn fluid sky"
                            onClick={() => {
                              setSelected({ dbIndex: index, tableIndex: i });
                              setNewColumns([...table.columns]);
                              setColumnsModal(true);
                            }}
                          >
                            edit
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn fluid red"
                            onClick={() => delTables(index, i)}
                          >
                            delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td>#</td>
                      <td>
                        <input
                          type="text"
                          placeholder="source"
                          value={newTableDB.sourceTable}
                          onChange={(e) =>
                            setNewTableDB({
                              ...newTableDB,
                              sourceTable: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="target"
                          value={newTableDB.targetTable}
                          onChange={(e) =>
                            setNewTableDB({
                              ...newTableDB,
                              targetTable: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={newTableDB.filterByCol.source}
                          onChange={(e) =>
                            setNewTableDB({
                              ...newTableDB,
                              filterByCol: {
                                ...newTableDB.filterByCol,
                                source: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="">Select Column</option>
                          {newTableDB.columns.map((col, i) => (
                            <option key={i} value={col.source}>
                              {col.source}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={newTableDB.filterByCol.target}
                          onChange={(e) =>
                            setNewTableDB({
                              ...newTableDB,
                              filterByCol: {
                                ...newTableDB.filterByCol,
                                target: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="">Select Column</option>
                          {newTableDB.columns.map((col, i) => (
                            <option key={i} value={col.target}>
                              {col.target}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={newTableDB.filterByCol.type}
                          onChange={(e) =>
                            setNewTableDB({
                              ...newTableDB,
                              filterByCol: {
                                ...newTableDB.filterByCol,
                                type: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="PRIMARYKEY">PRIMARYKEY</option>
                          <option value="TIMESTAMP">TIMESTAMP</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn fluid sky"
                          type="button"
                          onClick={() => {
                            setNewColumns(newTableDB.columns);
                            setColumnsModal(true);
                          }}
                        >
                          edit
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn fluid green"
                          type="button"
                          disabled={
                            newTableDB.sourceTable.length === 0 ||
                            newTableDB.targetTable.length === 0 ||
                            newTableDB.filterByCol.source.length === 0 ||
                            newTableDB.filterByCol.target.length === 0 ||
                            newTableDB.columns.length === 0
                          }
                          onClick={() => {
                            setNewDB({
                              ...newDB,
                              tables: [...newDB.tables, newTableDB],
                            });
                            setNewTableDB({
                              sourceTable: "",
                              targetTable: "",
                              filterByCol: {
                                source: "",
                                target: "",
                                type: "PRIMARYKEY",
                              },
                              columns: [],
                            });
                          }}
                        >
                          add
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn yellow" type="reset" onClick={clearNewDB}>
                Cancel
              </button>
              <button type="submit" className="btn green">
                Save
              </button>
            </div>
          </form>
        )}
        {databases.length > 0 &&
          databases.map((database, index) => (
            <div key={index} className="database-container">
              <div className="connection">
                <div className="source">
                  <h4 className="heading">Source</h4>
                  <div className="connection-wrapper">
                    <div className="connection-input-wrapper">
                      <label htmlFor={"source-database-" + index}>
                        Database
                      </label>
                      <input
                        id={"source-database-" + index}
                        type="text"
                        placeholder="Database"
                        value={database.connection.source.database}
                        onChange={(e) => {
                          updateConnectionSourceHandler(e, index, "database");
                        }}
                        required
                      />
                    </div>
                    <div className="connection-input-wrapper">
                      <label htmlFor={"source-user-" + index}>User</label>
                      <input
                        id={"source-user-" + index}
                        type="text"
                        placeholder="User"
                        value={database.connection.source.user}
                        onChange={(e) => {
                          updateConnectionSourceHandler(e, index, "user");
                        }}
                        required
                      />
                    </div>
                    <div className="connection-input-wrapper">
                      <label htmlFor={"source-password-" + index}>
                        Password
                      </label>
                      <input
                        id={"source-password-" + index}
                        type="text"
                        placeholder="Password"
                        value={database.connection.source.password}
                        onChange={(e) => {
                          updateConnectionSourceHandler(e, index, "password");
                        }}
                        required
                      />
                    </div>
                    <div className="connection-input-wrapper">
                      <label htmlFor={"source-host-" + index}>Host</label>
                      <input
                        id={"source-host-" + index}
                        type="text"
                        placeholder="Host"
                        value={database.connection.source.host}
                        onChange={(e) => {
                          updateConnectionSourceHandler(e, index, "host");
                        }}
                        required
                      />
                    </div>
                    <div className="connection-input-wrapper">
                      <label htmlFor={"source-port-" + index}>Port</label>
                      <input
                        id={"source-port-" + index}
                        type="number"
                        placeholder="Port"
                        value={database.connection.source.port}
                        onChange={(e) => {
                          updateConnectionSourceHandler(e, index, "port");
                        }}
                        required
                      />
                    </div>
                    <div className="connection-input-wrapper">
                      <label htmlFor={"source-dialect-" + index}>Dialect</label>
                      <input
                        id={"source-dialect-" + index}
                        type="text"
                        placeholder="Dialect"
                        value="oracle"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="target">
                  <h4 className="heading">Target</h4>
                  <div className="connection-wrapper">
                    <div className="connection-input-wrapper">
                      <label htmlFor={"target-database-" + index}>
                        Database
                      </label>
                      <input
                        id={"target-database-" + index}
                        type="text"
                        placeholder="Database"
                        value={database.connection.target.database}
                        onChange={(e) => {
                          updateConnectionTargetHandler(e, index, "database");
                        }}
                        required
                      />
                    </div>
                    <div className="connection-input-wrapper">
                      <label htmlFor={"target-user-" + index}>User</label>
                      <input
                        id={"target-user-" + index}
                        type="text"
                        placeholder="User"
                        value={database.connection.target.user}
                        onChange={(e) => {
                          updateConnectionTargetHandler(e, index, "user");
                        }}
                        required
                      />
                    </div>
                    <div className="connection-input-wrapper">
                      <label htmlFor={"target-password-" + index}>
                        Password
                      </label>
                      <input
                        id={"target-password-" + index}
                        type="text"
                        placeholder="Password"
                        value={database.connection.target.password}
                        onChange={(e) => {
                          updateConnectionTargetHandler(e, index, "password");
                        }}
                        required
                      />
                    </div>
                    <div className="connection-input-wrapper">
                      <label htmlFor={"target-host-" + index}>Host</label>
                      <input
                        id={"target-host-" + index}
                        type="text"
                        placeholder="Host"
                        value={database.connection.target.host}
                        onChange={(e) => {
                          updateConnectionTargetHandler(e, index, "host");
                        }}
                        required
                      />
                    </div>
                    <div className="connection-input-wrapper">
                      <label htmlFor={"target-port-" + index}>Port</label>
                      <input
                        id={"target-port-" + index}
                        type="number"
                        placeholder="Port"
                        value={database.connection.target.port}
                        onChange={(e) => {
                          updateConnectionTargetHandler(e, index, "port");
                        }}
                        required
                      />
                    </div>
                    <div className="connection-input-wrapper">
                      <label htmlFor={"target-dialect-" + index}>Dialect</label>
                      <input
                        id={"target-dialect-" + index}
                        type="text"
                        placeholder="Dialect"
                        value="postgres"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tables">
                <h4 className="heading">Tables</h4>
                <div className="tables-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Source Table</th>
                        <th scope="col">Target Table</th>
                        <th scope="col">filtered source col</th>
                        <th scope="col">filtered target col</th>
                        <th scope="col">filtered col type</th>
                        <th scope="col">Columns</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {database.tables.map((table, i) => (
                        <tr key={i}>
                          <th scope="row" className=" whitespace-nowrap">
                            {i + 1}
                          </th>
                          <td>
                            <input
                              type="text"
                              value={table.sourceTable}
                              onChange={(e) =>
                                updateTableProperty(index, i, "sourceTable", e)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={table.targetTable}
                              onChange={(e) =>
                                updateTableProperty(index, i, "targetTable", e)
                              }
                            />
                          </td>
                          <td>
                            <select
                              value={table.filterByCol.source}
                              onChange={(e) =>
                                updateTableProperty(index, i, "source", e, true)
                              }
                            >
                              {table.columns.map((column, index) => (
                                <option key={index} value={column.source}>
                                  {column.source}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              value={table.filterByCol.target}
                              onChange={(e) =>
                                updateTableProperty(index, i, "target", e, true)
                              }
                            >
                              {table.columns.map((column, index) => (
                                <option key={index} value={column.target}>
                                  {column.target}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              value={table.filterByCol.type}
                              onChange={(e) =>
                                updateTableProperty(index, i, "type", e, true)
                              }
                            >
                              <option value="PRIMARYKEY">PRIMARYKEY</option>
                              <option value="TIMESTAMP">TIMESTAMP</option>
                            </select>
                          </td>
                          <td>
                            <button
                              className="btn fluid sky"
                              onClick={() => {
                                setSelected({ dbIndex: index, tableIndex: i });
                                setNewColumns([...table.columns]);
                                setColumnsModal(true);
                              }}
                            >
                              edit
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn fluid red"
                              onClick={() => delTables(index, i)}
                            >
                              delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      <tr>
                        <td>#</td>
                        <td>
                          <input
                            type="text"
                            placeholder="source"
                            value={newTable.sourceTable}
                            onChange={(e) =>
                              setNewTable({
                                ...newTable,
                                sourceTable: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="target"
                            value={newTable.targetTable}
                            onChange={(e) =>
                              setNewTable({
                                ...newTable,
                                targetTable: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <select
                            value={newTable.filterByCol.source}
                            onChange={(e) =>
                              setNewTable({
                                ...newTable,
                                filterByCol: {
                                  ...newTable.filterByCol,
                                  source: e.target.value,
                                },
                              })
                            }
                          >
                            <option value="">Select Column</option>
                            {newTable.columns.map((col, i) => (
                              <option key={i} value={col.source}>
                                {col.source}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={newTable.filterByCol.target}
                            onChange={(e) =>
                              setNewTable({
                                ...newTable,
                                filterByCol: {
                                  ...newTable.filterByCol,
                                  target: e.target.value,
                                },
                              })
                            }
                          >
                            <option value="">Select Column</option>
                            {newTable.columns.map((col, i) => (
                              <option key={i} value={col.target}>
                                {col.target}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={newTable.filterByCol.type}
                            onChange={(e) =>
                              setNewTable({
                                ...newTable,
                                filterByCol: {
                                  ...newTable.filterByCol,
                                  type: e.target.value,
                                },
                              })
                            }
                          >
                            <option value="PRIMARYKEY">PRIMARYKEY</option>
                            <option value="TIMESTAMP">TIMESTAMP</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn fluid sky"
                            onClick={() => {
                              setNewColumns(newTable.columns);
                              setColumnsModal(true);
                            }}
                          >
                            edit
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn fluid green"
                            disabled={
                              newTable.sourceTable.length === 0 ||
                              newTable.targetTable.length === 0 ||
                              newTable.filterByCol.source.length === 0 ||
                              newTable.filterByCol.target.length === 0 ||
                              newTable.columns.length === 0
                            }
                            onClick={() => addNewTable(index)}
                          >
                            add
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
      </Layout>
    </>
  );
}
