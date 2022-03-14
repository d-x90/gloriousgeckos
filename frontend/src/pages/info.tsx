const Info = () => {
  return (
    <div style={{ paddingLeft: '16px', width: '70vw' }}>
      <h1>Rules</h1>
      <ul style={{ fontSize: '20px' }}>
        <li>
          The goal of the game is to reach to the top without losing 3 lives
        </li>
        <li>
          Collect $GLORY along the way (collected $GLORY added to your balance
          even if you die)
        </li>
        <li>
          If you die, your NFT will be dead until the next sunday and you can't
          play with it
        </li>
        <li>
          If you hold at least one GloriousGeckos NFT then all your NFTs will be
          resurrected at every midnight (UTC)
        </li>
        <li>
          You can revive NFTs with revive potions that can be bought for 100
          $GLORY
        </li>
        <li>
          With one NFT you can earn a maximum of 500$GLORY each day (cooldown
          until midnight (UTC))
        </li>
        <li>
          Besides selecting a NFT to play with you can select other NFTs as
          secondaries (Checkbox in the bottom right corner of NFTs). With a
          secondary NFT you earn the collected amount of $GLORY for each NFT you
          selected as secondary (up to the maximum daily limit per NFT). If you
          die, all secondaries die as well (except GloriousGeckos NFTs, they
          don't die when selected as a secondary)
        </li>
      </ul>
      <h1>Upcoming features</h1>
      <ul style={{ fontSize: '20px' }}>
        <li>In game weapons and consumables</li>
        <li>New maps, new enemies, new Game-modes</li>
        <li>Lootboxes with in-game items and NFT prizes</li>
        <li>Deposit&withdraw $GLORY</li>
        <li>Deposit $DUST</li>
        <li>And many more..</li>
      </ul>
    </div>
  );
};

export default Info;
