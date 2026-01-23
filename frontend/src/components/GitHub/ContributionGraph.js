import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { githubAPI } from '../../services/api';

function ContributionGraph() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      const response = await githubAPI.getContributionGraph(365);
      setContributions(response.data);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContributionLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  const getContributionColor = (level) => {
    const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    return colors[level];
  };

  // Group contributions by week
  const groupByWeek = () => {
    const weeks = [];
    let currentWeek = [];
    
    contributions.forEach((contrib, index) => {
      const date = new Date(contrib.date);
      currentWeek.push(contrib);
      
      if (date.getDay() === 6 || index === contributions.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return weeks;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No contribution data available. Sync your GitHub data to see your activity.
      </div>
    );
  }

  const weeks = groupByWeek();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div>
      <div className="contribution-graph-container" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'inline-block', minWidth: '100%' }}>
          {/* Month labels */}
          <div style={{ display: 'flex', marginBottom: '8px', paddingLeft: '30px' }}>
            {months.map((month, index) => (
              <div key={index} style={{ flex: 1, fontSize: '12px', color: '#666' }}>
                {month}
              </div>
            ))}
          </div>

          {/* Day labels and contribution grid */}
          <div style={{ display: 'flex' }}>
            {/* Day labels */}
            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '8px' }}>
              <div style={{ height: '13px', fontSize: '10px', color: '#666' }}>Mon</div>
              <div style={{ height: '13px' }}></div>
              <div style={{ height: '13px', fontSize: '10px', color: '#666' }}>Wed</div>
              <div style={{ height: '13px' }}></div>
              <div style={{ height: '13px', fontSize: '10px', color: '#666' }}>Fri</div>
              <div style={{ height: '13px' }}></div>
              <div style={{ height: '13px' }}></div>
            </div>

            {/* Contribution squares */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {week.map((contrib, dayIndex) => {
                    const level = getContributionLevel(contrib.count);
                    const color = getContributionColor(level);
                    
                    return (
                      <div
                        key={dayIndex}
                        title={`${contrib.date}: ${contrib.count} contributions`}
                        style={{
                          width: '11px',
                          height: '11px',
                          backgroundColor: color,
                          borderRadius: '2px',
                          cursor: 'pointer',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '12px', fontSize: '12px', color: '#666' }}>
            <span style={{ marginRight: '8px' }}>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                style={{
                  width: '11px',
                  height: '11px',
                  backgroundColor: getContributionColor(level),
                  marginRight: '3px',
                  borderRadius: '2px',
                }}
              />
            ))}
            <span style={{ marginLeft: '5px' }}>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContributionGraph;