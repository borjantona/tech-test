
export interface MatchesUsers {
  today: Date;
  todayString: string;
  yesterday: Date;
}

function usePtDate(): MatchesUsers {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return {
    todayString, 
	today,
    yesterday,
  };
}

export { usePtDate };
