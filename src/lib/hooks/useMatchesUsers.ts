import { useApiFetcher } from "../api";
import { Match, User } from "../api-types";
import { useEffect, useState } from "react";

export interface MatchesUsers {
  matches: Match[];
  users: User[];
}

/**
 * Exports the users and matches to prepare the download CSV functionality
 *
 *
 */
function useMatchesUsers(): MatchesUsers {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const fetcher = useApiFetcher();


  useEffect(() => {
    const getAllData = async (): Promise<{
      matches: Match[];
      users: User[];
    }> => {
      const matches: Match[] = [];
      let users: User[] = [];
      let page = 0;
      const size = 10;
      let results = -1;

      while (results === -1 || results === size) {
        const res = await fetcher("GET /v1/matches", { page, size });
        if (!res.ok) {
          throw new Error(res.data.message);
        } else {
          matches.push(...res.data);
          results = res.data.length;
        }
        page++;
      }

      users = matches
        .flatMap((match) => match.teams.flatMap((team) => team.players))
        .filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.userId === user.userId)
        );

      return { matches, users };
    };
    getAllData()
      .then((data) => {
        setMatches(data.matches);
        setUsers(data.users);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [fetcher]);

  return {
    matches,
    users,
  };
}

export { useMatchesUsers };
