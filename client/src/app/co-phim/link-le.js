import React, { Component, useState, useEffect } from "react";
import { ProgressBar, Pagination } from "react-bootstrap";
import _ from "lodash";
import { linkLeService } from "./link-le.service";
const STATUS = {
  failed: 2,
  todo: 0,
  done: 1,
};
const TYPE = {
  failed: "FAILED",
  todo: "TODO",
  done: "DONE",
};

const Table = (props) => {
  const { type } = props;
  const status =
    type === TYPE.done
      ? STATUS.done
      : type === TYPE.failed
      ? STATUS.failed
      : STATUS.todo;
  const classBadge =
    type === TYPE.failed
      ? "badge-danger"
      : type === TYPE.done
      ? "badge-success"
      : "badge-info";
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState(<></>);
  useEffect(() => {
    const fetchItems = async () => {
      const res = await linkLeService.getItems(status, page, limit);
      setResults(res.results || []);
      setTotalPage(res.totalPages || 0);
      setTotalResults(res.totalResults || 0);
      //   if (res.totalPages > 0 && res.totalPages <= 5) {
      //     let active = res.page;
      //     let items = [];
      //     for (let number = 1; number <= res.totalPages; number++) {
      //       items.push(
      //         <Pagination.Item key={number} active={number === active}>
      //           {number}
      //         </Pagination.Item>
      //       );
      //     }
      //     setPagination(items);
      //   }
    };
    fetchItems();
    const time = setInterval(fetchItems, 3000);
    return () => {
      clearInterval(time);
    };
  }, [page, limit]);

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title">{type}</h4>
        <p className="card-description">
          {" "}
          Total <code>{totalResults}</code> items. Total{" "}
          <code>{totalPage}</code> pages.
        </p>
        {_.isEmpty(results) && "Empty"}
        {!_.isEmpty(results) && (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Link</th>
                  <th>Thumb</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, index) => {
                  return (
                    <tr>
                      <td>{index + 1}</td>
                      <td>
                        <a href={item.link} target="_blank">
                          {item.link}
                        </a>
                      </td>
                      <td className="py-1">
                        <img src={item.thumb} alt="Thumb" />
                      </td>
                      <td>
                        <label className={`badge ${classBadge}`}>{type}</label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* {pagination && <Pagination>{pagination}</Pagination>} */}
      </div>
    </div>
  );
};

export class CoPhimLinkLeComponent extends Component {
  render() {
    return (
      <div>
        <div className="page-header">
          <h3 className="page-title"> CỎ PHIM </h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="!#" onClick={(event) => event.preventDefault()}>
                  Cỏ phim
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Link phim lẻ
              </li>
            </ol>
          </nav>
        </div>
        <div className="row">
          <div className="col-lg-6 grid-margin stretch-card">
            <Table type="TO-DO" />
          </div>
          <div className="col-lg-6 grid-margin stretch-card">
            <Table type="DONE" />
          </div>
          <div className="col-lg-12 grid-margin stretch-card">
            <Table type="FAILED" />
          </div>
          <div className="col-lg-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Bordered table</h4>
                <p className="card-description">
                  {" "}
                  Add className <code>.table-bordered</code>
                </p>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th> # </th>
                        <th> First name </th>
                        <th> Progress </th>
                        <th> Amount </th>
                        <th> Deadline </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td> 1 </td>
                        <td> Herman Beck </td>
                        <td>
                          <ProgressBar variant="success" now={25} />
                        </td>
                        <td> $ 77.99 </td>
                        <td> May 15, 2015 </td>
                      </tr>
                      <tr>
                        <td> 2 </td>
                        <td> Messsy Adam </td>
                        <td>
                          <ProgressBar variant="danger" now={75} />
                        </td>
                        <td> $245.30 </td>
                        <td> July 1, 2015 </td>
                      </tr>
                      <tr>
                        <td> 3 </td>
                        <td> John Richards </td>
                        <td>
                          <ProgressBar variant="warning" now={90} />
                        </td>
                        <td> $138.00 </td>
                        <td> Apr 12, 2015 </td>
                      </tr>
                      <tr>
                        <td> 4 </td>
                        <td> Peter Meggik </td>
                        <td>
                          <ProgressBar variant="primary" now={50} />
                        </td>
                        <td> $ 77.99 </td>
                        <td> May 15, 2015 </td>
                      </tr>
                      <tr>
                        <td> 5 </td>
                        <td> Edward </td>
                        <td>
                          <ProgressBar variant="danger" now={35} />
                        </td>
                        <td> $ 160.25 </td>
                        <td> May 03, 2015 </td>
                      </tr>
                      <tr>
                        <td> 6 </td>
                        <td> John Doe </td>
                        <td>
                          <ProgressBar variant="info" now={65} />
                        </td>
                        <td> $ 123.21 </td>
                        <td> April 05, 2015 </td>
                      </tr>
                      <tr>
                        <td> 7 </td>
                        <td> Henry Tom </td>
                        <td>
                          <ProgressBar variant="warning" now={20} />
                        </td>
                        <td> $ 150.00 </td>
                        <td> June 16, 2015 </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Inverse table</h4>
                <p className="card-description">
                  {" "}
                  Add className <code>.table-dark</code>
                </p>
                <div className="table-responsive">
                  <table className="table table-dark">
                    <thead>
                      <tr>
                        <th> # </th>
                        <th> First name </th>
                        <th> Amount </th>
                        <th> Deadline </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td> 1 </td>
                        <td> Herman Beck </td>
                        <td> $ 77.99 </td>
                        <td> May 15, 2015 </td>
                      </tr>
                      <tr>
                        <td> 2 </td>
                        <td> Messsy Adam </td>
                        <td> $245.30 </td>
                        <td> July 1, 2015 </td>
                      </tr>
                      <tr>
                        <td> 3 </td>
                        <td> John Richards </td>
                        <td> $138.00 </td>
                        <td> Apr 12, 2015 </td>
                      </tr>
                      <tr>
                        <td> 4 </td>
                        <td> Peter Meggik </td>
                        <td> $ 77.99 </td>
                        <td> May 15, 2015 </td>
                      </tr>
                      <tr>
                        <td> 5 </td>
                        <td> Edward </td>
                        <td> $ 160.25 </td>
                        <td> May 03, 2015 </td>
                      </tr>
                      <tr>
                        <td> 6 </td>
                        <td> John Doe </td>
                        <td> $ 123.21 </td>
                        <td> April 05, 2015 </td>
                      </tr>
                      <tr>
                        <td> 7 </td>
                        <td> Henry Tom </td>
                        <td> $ 150.00 </td>
                        <td> June 16, 2015 </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12 stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Table with contextual classNames</h4>
                <p className="card-description">
                  {" "}
                  Add className <code>.table-&#123;color&#125;</code>
                </p>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th> # </th>
                        <th> First name </th>
                        <th> Product </th>
                        <th> Amount </th>
                        <th> Deadline </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-info">
                        <td> 1 </td>
                        <td> Herman Beck </td>
                        <td> Photoshop </td>
                        <td> $ 77.99 </td>
                        <td> May 15, 2015 </td>
                      </tr>
                      <tr className="table-warning">
                        <td> 2 </td>
                        <td> Messsy Adam </td>
                        <td> Flash </td>
                        <td> $245.30 </td>
                        <td> July 1, 2015 </td>
                      </tr>
                      <tr className="table-danger">
                        <td> 3 </td>
                        <td> John Richards </td>
                        <td> Premeire </td>
                        <td> $138.00 </td>
                        <td> Apr 12, 2015 </td>
                      </tr>
                      <tr className="table-success">
                        <td> 4 </td>
                        <td> Peter Meggik </td>
                        <td> After effects </td>
                        <td> $ 77.99 </td>
                        <td> May 15, 2015 </td>
                      </tr>
                      <tr className="table-primary">
                        <td> 5 </td>
                        <td> Edward </td>
                        <td> Illustrator </td>
                        <td> $ 160.25 </td>
                        <td> May 03, 2015 </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CoPhimLinkLeComponent;
