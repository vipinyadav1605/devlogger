import React, { useState, useEffect } from "react";
import { Table, Badge, Spinner, Button } from "react-bootstrap";
import { githubAPI } from "../../services/api";

function RepositoryList() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const response = await githubAPI.getRepos();
      setRepos(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching repositories:", error);
    } finally {
      setLoading(false);
    }
  };

  const languageColors = {
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Java: "#b07219",
    TypeScript: "#2b7489",
    "C++": "#f34b7d",
    C: "#555555",
    "C#": "#178600",
    PHP: "#4F5D95",
    Ruby: "#701516",
    Go: "#00ADD8",
    Rust: "#dea584",
    Swift: "#ffac45",
    Kotlin: "#F18E33",
    HTML: "#e34c26",
    CSS: "#563d7c",
  };

  const filteredRepos = repos.filter((repo) => {
    if (filter === "stars") return repo.stargazers_count > 0;
    if (filter === "forks") return repo.forks_count > 0;
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No repositories found. Sync your GitHub data to see your repos.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <Button
          variant={filter === "all" ? "primary" : "outline-primary"}
          size="sm"
          className="me-2"
          onClick={() => setFilter("all")}
        >
          All ({repos.length})
        </Button>
        <Button
          variant={filter === "stars" ? "primary" : "outline-primary"}
          size="sm"
          className="me-2"
          onClick={() => setFilter("stars")}
        >
           Starred
        </Button>
        <Button
          variant={filter === "forks" ? "primary" : "outline-primary"}
          size="sm"
          onClick={() => setFilter("forks")}
        >
           Forked
        </Button>
      </div>

      <div className="table-responsive">
        <Table hover>
          <thead>
            <tr>
              <th>Repository</th>
              <th>Language</th>
              <th> Stars</th>
              <th> Forks</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepos.map((repo) => (
              <tr key={repo.id}>
                <td>
                  <div>
                    <strong>{repo.name}</strong>
                    {repo.is_private && (
                      <Badge bg="warning" className="ms-2">
                        Private
                      </Badge>
                    )}
                    {repo.is_fork && (
                      <Badge bg="secondary" className="ms-2">
                        Fork
                      </Badge>
                    )}
                  </div>
                  {repo.description && (
                    <small className="text-muted d-block mt-1">
                      {repo.description.length > 100
                        ? repo.description.substring(0, 100) + "..."
                        : repo.description}
                    </small>
                  )}
                </td>
                <td>
                  {repo.language && (
                    <Badge
                      bg="light"
                      text="dark"
                      style={{
                        borderLeft: `3px solid ${languageColors[repo.language] || "#ccc"}`,
                      }}
                    >
                      {repo.language}
                    </Badge>
                  )}
                </td>
                <td>{repo.stargazers_count}</td>
                <td>{repo.forks_count}</td>
                <td>
                  <small className="text-muted">
                    {new Date(repo.updated_at).toLocaleDateString()}
                  </small>
                </td>
                <td>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    View on GitHub
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default RepositoryList;
