type TimeTokensProps = {
  count: number;
  minutes: number | null;
};

export function TimeTokens({ count, minutes }: TimeTokensProps) {
  if (count === 0 || minutes === null) return null;

  return (
    <div className="time-tokens" aria-label={`Environ ${minutes} minutes restantes`}>
      <div className="token-row" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <span className="time-token" key={index} />
        ))}
      </div>
      <p>{minutes} min</p>
    </div>
  );
}
