import * as React from 'react';

const dot = <span className="dot">&bull;</span>;

class ContributorsDetails extends React.Component {
  public render() {
    return (
      <div className="outsideDetails">
        <div className="contributorsDetails">
          <h3>The people behind Source Academy</h3>
          <p>
            The <i>Source Academy</i> is designed by and for students of the National University of
            Singapore. Students who completed the CS1101S module come back to coach their juniors as
            "Avengers" or to further develop and improve the Academy. This page includes all
            developers who contributed to the Source Academy <i>Cadet</i> (2018), a re-development
            of its precursors, the original Source Academy (2016) and Source Academy 2 (2017).
          </p>
          <div className="leadership">
            <h5>
              <strong>
                <u>2019 Leadership</u>
              </strong>
            </h5>
            <p>
              Liow Jia Chen
              <br />
              <strong>(Backend)</strong>
            </p>
            {dot}
            <p>
              Ge Shuming
              <br />
              <strong>(Frontend)</strong>
            </p>
            {dot}
            <p>
              Rahul Rajesh
              <br />
              <strong>(DevOps)</strong>
            </p>
            {dot}
            <p>
              Daryl Tan
              <br />
              <strong>(Source)</strong>
            </p>
            {dot}
            <p>
              Martin Henz
              <br />
              <strong>(Coordination)</strong>
            </p>
          </div>
          <div className="hallOfFame">
            <h5>
              <strong>
                <u>Hall of Fame</u>
              </strong>
            </h5>
            <p>
              <strong>Cadet architect</strong>
            </p>
            <p>Evan Sebastian</p>
            <p>
              <strong>Cadet core team</strong>
            </p>
            <p>
              Julius Putra Tanu Setiaji {dot} Lee Ning Yuan {dot} Vignesh Shankar {dot} Thomas Tan{' '}
              {dot} Chen Shaowei
            </p>
            <p>
              <strong>Graphic design</strong>
            </p>
            <p>
              Ng Tse Pei {dot} Joey Yeo {dot} Tan Yu Wei
            </p>
          </div>
          <div className="contributors">
            <h5>
              <strong>
                <u>All Contributors</u>
              </strong>
            </h5>
            <p>
              Here goes the full list of contributors to the Source Academy with their pull requests
              in the repos: cadet, cadet-frontend, grader, js-slang, sharedb-ace-backend
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default ContributorsDetails;
