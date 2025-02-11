import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DeckCard } from '../../models/DeckCard';
import PlayingCard from './PlayingCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getActiveAbilities, getBeg, getDealer, getLift, getLiftWinner, getMatchWinner, getMessage, getPlayerCards, getPlayerJoinedRoom, getPlayerList, getPlayerStatus, getRoundWinners, getTurn, setMessage } from '../../slices/game.slice';
import { PlayerSocket } from '../../models/PlayerSocket';
import DealerIcon from './StatusIcons/DealerIcon';
import TurnIcon from './StatusIcons/TurnIcon';
import Modal from '../../core/components/Modal';
import Button from '../../core/components/Button';
import { toast } from 'react-toastify';
import GameInfo from './GameInfo';
import RoundWinnersModal from './Modals/RoundWinnersModal';
import { RoundWinners } from '../../models/RoundWinners';
import { useRouter } from 'next/navigation';
import { socket } from '../SocketClient';
import { CardAbilities } from '../../core/services/abilities';
import Marker from './PositionMarkers/Marker';
import { setPlayer1HandPos, setPlayer2HandPos, setPlayer3HandPos, setPlayer4HandPos } from '../../slices/position.slice';
import AbilitiesDisabledIcon from './StatusIcons/AbilitiesDisabledIcon';
import DoubleLiftIcon from './StatusIcons/DoubleLiftIcon';
import DoublePointsIcon from './StatusIcons/DoublePointsIcon';
import NinePowerfulIcon from './StatusIcons/NinePowerfulIcon';
import NoWinLiftIcon from './StatusIcons/NoWinLiftIcon';
import OppositePowerIcon from './StatusIcons/OppositePowerIcon';
import RoyalsDisabledIcon from './StatusIcons/RoyalsDisabledIcon';
import TrumpDisabledIcon from './StatusIcons/TrumpDisabledIcon';
import TwoWinGameIcon from './StatusIcons/TwoWinGameIcon';
import HangSaverIcon from './StatusIcons/HangSaverIcon';
import { isCardRoyal } from '../../core/services/sharedGameFunctions';

interface Props {
  roomId?: string;
}


export default function Gameboard({ roomId }: Props) {

  const router = useRouter();

  const dispatch = useAppDispatch();


  const players = useAppSelector(getPlayerList);

  const dealer = useAppSelector(getDealer);

  const playerTurn = useAppSelector(getTurn);

  const begState = useAppSelector(getBeg);

  const message = useAppSelector(getMessage);

  const lift = useAppSelector(getLift);

  const roundWinners = useAppSelector(getRoundWinners);

  const matchWinner = useAppSelector(getMatchWinner);

  const liftWinner = useAppSelector(getLiftWinner);

  const playerJoinedRoom = useAppSelector(getPlayerJoinedRoom);

  const activeAbilities = useAppSelector(getActiveAbilities);

  const playerStatus = useAppSelector(getPlayerStatus);

  // Cards in the hand of the client player
  const playerCards = useAppSelector(getPlayerCards);


  const [begModalVisible, setBegModalVisible] = useState<boolean>(false);
  const [begResponseModalVisible, setBegResponseModalVisible] = useState<boolean>(false);
  const [waitingBegResponseModalVisible, setWaitingBegResponseModalVisible] = useState<boolean>(false);
  const [redealModalVisible, setRedealModalVisible] = useState<boolean>(false);
  const [roundWinnersModalVisible, setRoundWinnersModalVisible] = useState<boolean>(false);
  const [oppSelectionModalVisible, setOppSelectionModalVisible] = useState<boolean>(false);

  // Selected opponent when choosing opponent from ability
  const [selectedOpp, setSelectedOpp] = useState<PlayerSocket>();

  // Selected card when choosing card from hand from ability
  const [selectedCard, setSelectedCard] = useState<DeckCard>();

  // If a card ability allows the player to target a card in the lift
  const [isTargettingLift, setIsTargettingLift] = useState<boolean>(false);

  // If a card ability allows the player to target an opponent's card in the lift
  const [isTargettingOppLift, setIsTargettingOppLift] = useState<boolean>(false);

  // Card that a player played which triggered a target ability
  const [playedCard, setPlayedCard] = useState<DeckCard>();

  // Store round winners in a state to keep round winners stored in case it is wiped from server
  const [roundWinnersStored, setRoundWinnersStored] = useState<RoundWinners>();


  // React refs for player hand div
  const player1Hand = useRef<HTMLDivElement>(null);
  const player2Hand = useRef<HTMLDivElement>(null);
  const player3Hand = useRef<HTMLDivElement>(null);
  const player4Hand = useRef<HTMLDivElement>(null);

  // React states to manage what cards players have
  const [player1Cards, setPlayer1Cards] = useState<DeckCard[]>([]);

  const [player1Data, setPlayer1Data] = useState<PlayerSocket>({});
  const [player2Data, setPlayer2Data] = useState<PlayerSocket>({});
  const [player3Data, setPlayer3Data] = useState<PlayerSocket>({});
  const [player4Data, setPlayer4Data] = useState<PlayerSocket>({});

  // Data to send to socket
  const socketData = useMemo(() => {
    // Get ID stored in local storage, otherwise set it
    let localId = typeof window !== 'undefined' ? localStorage.getItem("socketId") ?? undefined : undefined;

    if (!localId && socket?.id) {
      localStorage.setItem("socketId", socket.id);
      localId = socket.id
    }

    return ({
      roomId: roomId ? String(roomId) : undefined,
      localId: localId
    });
  }, [roomId]);

  // Get player number from server
  const playerNumber = useMemo(() => {
    return players.find(el => el.id == socketData.localId)?.player;
  }, [players, socketData]);

  // Determine whether or not it is the turn of the client player
  const isPlayer1Turn = useMemo(() => {
    if (playerNumber == playerTurn) {
      return true;
    }

    return false;
  }, [playerTurn, playerNumber]);

  // Determine whether or not client player is the dealer
  const isPlayer1Dealer = useMemo(() => {
    if (playerNumber == dealer) {
      return true;
    }

    return false;
  }, [dealer, playerNumber]);

  // Get data of player whose turn it is
  const turnPlayerData = useMemo(() => {

    // Reset state
    setPlayedCard(undefined);
    setIsTargettingLift(false);
    setIsTargettingOppLift(false);

    return players.find(el => el.player == playerTurn);
  }, [playerTurn, players]);


  // Get data of dealer
  const dealerData = useMemo(() => {
    return players.find(el => el.player == dealer);
  }, [dealer, players]);

  // Get mapped number of lift winner
  const liftWinnerMapped = useMemo(() => {
    if (!liftWinner || !playerNumber || !players) {
      return undefined;
    }

    const winnerPlayer = players.find(el => el.player == liftWinner)?.player;

    if (player1Data.player == winnerPlayer) {
      return 1;
    }
    else if (player2Data.player == winnerPlayer) {
      return 2;
    }
    else if (player3Data.player == winnerPlayer) {
      return 3;
    }
     else if (player4Data.player == winnerPlayer) {
      return 4;
    }

  }, [liftWinner, players, playerNumber, player1Data, player2Data, player3Data, player4Data]);

  // Lift cards
  const player1CardPlayed = useMemo(() => {
    if (!lift) {
      return undefined;
    }

    return lift.find(el => el.player == playerNumber);
  }, [lift]);

  const player2CardPlayed = useMemo(() => {
    if (!lift || !playerNumber) {
      return undefined;
    }

    const player2Number = playerNumber == 4 ? 1 : playerNumber + 1;

    return lift.find(el => el.player == player2Number);

  }, [lift, playerNumber]);

  const player3CardPlayed = useMemo(() => {
    if (!lift || !playerNumber) {
      return undefined;
    }

    const player3Number = playerNumber + 2 > 4 ? (playerNumber + 2) % 4 : playerNumber + 2;

    return lift.find(el => el.player == player3Number);


  }, [lift, playerNumber]);

  const player4CardPlayed = useMemo(() => {
    if (!lift || !playerNumber) {
      return undefined;
    }

    const player4Number = playerNumber + 3 > 4 ? (playerNumber + 3) % 4 : playerNumber + 3;

    return lift.find(el => el.player == player4Number);

  }, [lift, playerNumber]);


  const player1Status: CardAbilities[] = useMemo(() => {
    return getPlayerStatuses(player1Data);
  }, [playerStatus, player1Data]);

  const player2Status: CardAbilities[] = useMemo(() => {
    return getPlayerStatuses(player2Data);
  }, [playerStatus, player2Data]);

  const player3Status: CardAbilities[] = useMemo(() => {
    return getPlayerStatuses(player3Data);
  }, [playerStatus, player3Data]);

  const player4Status: CardAbilities[] = useMemo(() => {
    return getPlayerStatuses(player4Data);
  }, [playerStatus, player4Data]);


  const isForceStandCardInHand: boolean = useMemo(() => {
    let forceStand = false;

    player1Cards.forEach(el => {
      if (el.ability == CardAbilities.forceStand) {
        forceStand = true;
        return;
      }
    });

    return forceStand;
  }, [player1Cards]);

  function getPlayerStatuses(playerData: PlayerSocket) {
    if (!playerStatus) {
      return [];
    }

    const index = playerStatus.findIndex(el => el?.player?.player == playerData?.player);
    if (index == -1) {
      return [];
    }

    return playerStatus[index]?.status ?? [];
  }

  function getTeam2CardMargins(length: number) {
    return ({
      marginTop: (-6 + (length / 3) - 2) * length,
      marginBottom: (-6 + (length / 3) - 2) * length
    });
  }

  /*
    Render player cards on the screen
  */
  function displayPlayerCards(player: DeckCard[]) {
    setPlayer1Cards(player);
  }


  function playCard(card: DeckCard) {

    if (!isPlayer1Turn) {
      return;
    }

    // Check if abilities/royals are disabled before applying/sending ability data to server
    const areAbilitiesDisabled = activeAbilities.includes(CardAbilities.abilitiesDisabled);
    const areRoyalsDisabled = activeAbilities.includes(CardAbilities.royalsDisabled);

    if (isCardRoyal(card) && areRoyalsDisabled) {
      return;
    }

    if (!areAbilitiesDisabled) {
      // TODO: Handle cases where opponent hand is empty, lift is empty, etc...
      if (card.ability == CardAbilities.swapOppCard) {
        setOppSelectionModalVisible(true);
        setPlayedCard(card);
        return;
      }

      if (card.ability == CardAbilities.targetPowerless) {
        setIsTargettingLift(true);
        setPlayedCard(card);
        return;
      }

      if (card.ability == CardAbilities.oppReplay) {
        setIsTargettingOppLift(true);
        setPlayedCard(card);
        return;
      }

    }


    socket.emit('playCard', { ...socketData, card: { ...card, ability: areAbilitiesDisabled ? undefined : card.ability }, player: playerNumber });
  }

  function handleLiftCardClick(card: DeckCard) {

    if (isTargettingLift) {
      socket.emit('targetPowerless', { ...socketData, card: card, player: playerNumber });
    }
    else if (isTargettingOppLift) {
      socket.emit('oppReplay', { ...socketData, card: card, player: playerNumber });
    }

    socket.emit('playCard', { ...socketData, card: playedCard, player: playerNumber });
  }

  function handleSelectCard(card: DeckCard) {
    if (card.suit == playedCard.suit && card.value == playedCard.value) {
      return;
    }

    setSelectedCard(card);
  }

  function handleOppSelectionConfirm() {
    socket.emit('swapOppCard', { ...socketData, card: selectedCard, player: playerNumber, target: selectedOpp, playedCard: playedCard,  });
    handleOppSelectionClose();
  }

  function handleOppSelectionClose() {
    setOppSelectionModalVisible(false);
    setPlayedCard(undefined);
    setSelectedOpp(undefined);
    setSelectedCard(undefined);
  }

  useEffect(() => {
    displayPlayerCards(playerCards ?? []);
  }, [playerCards]);


  // Join room
  useEffect(() => {
    if (!socketData?.roomId) {
      router.push('/');
      toast('Sorry, this room does not exist!', {
        type: 'error',
        hideProgressBar: true
      });
      return;
    }

    socket?.emit('joinRoom', socketData);
  }, [socketData]);


  // Initialise game
  useEffect(() => {
    if (playerJoinedRoom) {
      socket.emit('initialiseGame', socketData);
    }
  }, [socketData, playerJoinedRoom]);



  // Set player data
  useEffect(() => {

    if (!players || players.length == 0 || !playerNumber) {
      return;
    }

    const playerDataServer: PlayerSocket[] = [];

    players.forEach((el) => {
      if (el.player) {
        playerDataServer[el.player] = el;
      }
    });

    setPlayer1Data(playerDataServer[playerNumber]);

    if (playerNumber == 1) {
      setPlayer2Data(playerDataServer[2]);

      setPlayer3Data(playerDataServer[3]);

      setPlayer4Data(playerDataServer[4]);
    }
    else if (playerNumber == 2) {
      setPlayer2Data(playerDataServer[3]);

      setPlayer3Data(playerDataServer[4]);

      setPlayer4Data(playerDataServer[1]);
    }
    else if (playerNumber == 3) {
      setPlayer2Data(playerDataServer[4]);

      setPlayer3Data(playerDataServer[1]);

      setPlayer4Data(playerDataServer[2]);
    }
    else if (playerNumber == 4) {
      setPlayer2Data(playerDataServer[1]);

      setPlayer3Data(playerDataServer[2]);

      setPlayer4Data(playerDataServer[3]);
    }

  }, [players, playerNumber]);

  // Manage round winner modal
  useEffect(() => {
    if (roundWinners) {
      setRoundWinnersModalVisible(true);
      setRoundWinnersStored(roundWinners);
    }
  }, [roundWinners]);

  // Manage beg modals
  useEffect(() => {
    if (!begState) {
      return;
    }

    if (begState == 'begged') {
      if (isPlayer1Dealer) {
        setBegResponseModalVisible(true);
      }
      else if (isPlayer1Turn) {
        setBegModalVisible(false);
        setWaitingBegResponseModalVisible(true);
      }
    }
    else if (begState == 'stand') {
      setBegModalVisible(false);
    }
    else if (begState == 'give') {
      setBegResponseModalVisible(false);
      setWaitingBegResponseModalVisible(false);
    }
    else if (begState == 'run') {
      setBegResponseModalVisible(false);
      setWaitingBegResponseModalVisible(false);
    }
    else if (begState == 'begging') {
      setRedealModalVisible(false);

      if (isPlayer1Turn) {
        setBegModalVisible(true);
      }
    }
  }, [begState, isPlayer1Dealer, isPlayer1Turn, turnPlayerData, dealerData]);



  useEffect(() => {
    if (message) {
      if (isPlayer1Dealer && message.shortcode == 'REDEAL') {
        setRedealModalVisible(true);
      }
      else if (
        isPlayer1Dealer && message.shortcode == 'GIVE'
        || (isPlayer1Turn || isPlayer1Dealer) && message.shortcode == 'BEGGED'
        || isPlayer1Dealer && message.shortcode == 'RUN'
      ) {
        //
      }
      else {
        toast(message.message, {
          type: 'default',
          hideProgressBar: true,
          position: 'top-center'
        });
      }

      dispatch(setMessage(undefined));
    }
  }, [message, isPlayer1Dealer, isPlayer1Turn]);

  useEffect(() => {
    if (matchWinner) {
      router.push(`/?roomId=${String(roomId)}`);
    }
  }, [matchWinner, roomId]);

  return (
    <div className="h-screen w-screen bg-slate-300">

      <div className='flex flex-row'>

        <GameInfo playerTeam={player1Data.team} socketData={socketData} />

        <div className="h-screen w-4/5">

          {/* ------------------------ Player 3 Info  ------------------------*/}
          <div className='h-[25vh] flex flex-col justify-between'>
            <div className='flex flex-col items-center justify-center p-3'>
              <div className='flex justify-center'>
                {
                  player3Data.nickname
                }
              </div>

              <div className='flex flex-row gap-2'>
                <DealerIcon active={dealerData && player3Data.id == dealerData.id} />
                <TurnIcon active={turnPlayerData && player3Data.id == turnPlayerData.id} />
                <HangSaverIcon active={player3Status.includes(CardAbilities.hangSaver)} />
              </div>
            </div>

            <div className="w-full flex flex-row justify-center items-center" ref={player3Hand}>
              {
                Array.from({ length: player3Data?.numCards ?? 0 }, (_, k) => (
                  <PlayingCard
                    key={'3' + k}
                    player={3}
                    isDeckCard
                    className='-mx-2 p-0'
                  />
                ))
              }

              <Marker dispatchFunction={setPlayer3HandPos} />
            </div>
          </div>
          {/* -----------------------------------------------------------------*/}




          <div className='flex flex-row'>
            {/* ------------------------ Player 4 Info  ------------------------*/}
            <div className='flex flex-col justify-center items-center w-2/12'>
              <div >
                {
                  player4Data.nickname
                }
              </div>

              <div className='flex flex-row flex-wrap gap-2'>
                <DealerIcon active={dealerData && player4Data.id == dealerData.id} />
                <TurnIcon active={turnPlayerData && player4Data.id == turnPlayerData.id} />
                <HangSaverIcon active={player4Status.includes(CardAbilities.hangSaver)} />
              </div>
            </div>

            <div className="w-1/6 h-[50vh] flex flex-col items-center justify-center gap-0" ref={player4Hand}>
              {
                Array.from({ length: player4Data?.numCards ?? 0 }, (_, k) => (
                  <PlayingCard
                    key={'4' + k}
                    player={4}
                    isDeckCard
                    className='rotate-90 p-0'
                    style={getTeam2CardMargins(player4Data?.numCards ?? 0)}
                  />
                ))
              }

              <Marker dispatchFunction={setPlayer4HandPos} />
            </div>
            {/* -----------------------------------------------------------------*/}





            {/* ------------------------ Lift Info  ------------------------*/}
            <div className='w-4/6 flex flex-col gap-2 items-center justify-center'>

              <PlayingCard
                cardData={player3CardPlayed}
                isOutline
                isNotPlayable={!isTargettingLift}
                liftCard={3}
                liftWinner={liftWinnerMapped}
                onClickHandler={handleLiftCardClick}
                spotlighted={isTargettingLift}
              />

              <div className='flex flex-row'>
                <PlayingCard
                  cardData={player4CardPlayed}
                  isOutline
                  isNotPlayable={!(isTargettingLift || isTargettingOppLift)}
                  liftCard={4}
                  liftWinner={liftWinnerMapped}
                  onClickHandler={handleLiftCardClick}
                  spotlighted={isTargettingLift || isTargettingOppLift}
                />

                <div className='w-32 px-2 flex flex-wrap justify-center items-center gap-2'>

                  <AbilitiesDisabledIcon active={activeAbilities?.includes(CardAbilities.abilitiesDisabled)} />
                  <RoyalsDisabledIcon active={activeAbilities?.includes(CardAbilities.royalsDisabled)} />
                  <TrumpDisabledIcon active={activeAbilities?.includes(CardAbilities.trumpDisabled)} />
                  <NoWinLiftIcon active={activeAbilities?.includes(CardAbilities.noWinLift)} />
                  <OppositePowerIcon active={activeAbilities?.includes(CardAbilities.oppositePower)} />
                  <DoubleLiftIcon active={activeAbilities?.includes(CardAbilities.doubleLift)} />
                  <DoublePointsIcon active={activeAbilities?.includes(CardAbilities.doublePoints)} />
                  <NinePowerfulIcon active={activeAbilities?.includes(CardAbilities.ninePowerful)} />
                  <TwoWinGameIcon active={activeAbilities?.includes(CardAbilities.twoWinGame)} />

                </div>

                <PlayingCard
                  cardData={player2CardPlayed}
                  isOutline
                  isNotPlayable={!(isTargettingLift || isTargettingOppLift)}
                  liftCard={2}
                  liftWinner={liftWinnerMapped}
                  onClickHandler={handleLiftCardClick}
                  spotlighted={isTargettingLift || isTargettingOppLift}
                />
              </div>


              <PlayingCard
                cardData={player1CardPlayed}
                isOutline
                isNotPlayable={!isTargettingLift}
                liftCard={1}
                liftWinner={liftWinnerMapped}
                spotlighted={isTargettingLift}
              />


            </div>
            {/* -------------------------------------------------------------*/}





            {/* ------------------------ Player 2 Info  ------------------------*/}
            <div className="w-1/6 h-[50vh] flex flex-col items-center justify-center gap-0" ref={player2Hand}>
              {
                Array.from({ length: player2Data?.numCards ?? 0 }, (_, k) => (
                  <PlayingCard
                    key={'2' + k}
                    player={2}
                    isDeckCard
                    className='rotate-90 p-0'
                    style={getTeam2CardMargins(player2Data?.numCards ?? 0)}
                  />
                ))
              }

              <Marker dispatchFunction={setPlayer2HandPos} />
            </div>

            <div className='flex flex-col justify-center items-center w-2/12'>
              <div >
                {
                  player2Data.nickname
                }
              </div>

              <div className='flex flex-row flex-wrap gap-2'>
                <DealerIcon active={dealerData && player2Data.id == dealerData.id} />
                <TurnIcon active={turnPlayerData && player2Data.id == turnPlayerData.id} />
                <HangSaverIcon active={player2Status.includes(CardAbilities.hangSaver)} />
              </div>
            </div>
            {/* -----------------------------------------------------------------*/}
          </div>






          {/* ------------------------ Player 1 Info  ------------------------*/}
          <div className='h-[25vh]'>

              <div className="w-full flex flex-row justify-center items-center" ref={player1Hand}>
              {
                Array.from({ length: player1Cards.length == 0 ? player1Data?.numCards ?? 0 : player1Cards.length}, (_, k) => {

                  const oppSelectionActive = (oppSelectionModalVisible && (!(player1Cards[k].suit == playedCard?.suit && player1Cards[k].value == playedCard?.value)));

                  return (
                    <PlayingCard
                      key={'1' + k}
                      player={1}
                      cardData={player1Cards[k]}
                      isDeckCard={player1Cards.length == 0 ? true : false}
                      onClickHandler={() => player1Cards.length == 0 ? undefined : oppSelectionModalVisible ? handleSelectCard(player1Cards[k]) : playCard(player1Cards[k])}
                      className='-mx-2'
                      spotlighted={oppSelectionActive}
                      glow={oppSelectionActive ? 'blue' : undefined}
                    />
                  );}
                )
              }

              <Marker dispatchFunction={setPlayer1HandPos} />
            </div>

            <div className='flex flex-col items-center justify-center p-3'>
              <div>
                {
                  player1Data.nickname
                }
              </div>

              <div className='flex flex-row gap-2'>
                <DealerIcon active={dealerData && player1Data.id == dealerData.id}/>
                <TurnIcon active={turnPlayerData && player1Data.id == turnPlayerData.id} />
                <HangSaverIcon active={player1Status.includes(CardAbilities.hangSaver)} />
              </div>

            </div>
          </div>
          {/* -----------------------------------------------------------------*/}

        </div>
      </div>


      {/* ------------------------ Modals ------------------------*/}
      <RoundWinnersModal isVisible={roundWinnersModalVisible} setIsVisible={setRoundWinnersModalVisible} players={players} roundWinners={roundWinnersStored} />

      <Modal open={begModalVisible && !roundWinnersModalVisible} closeOnDocumentClick={false} onClose={() => setBegModalVisible(false)}>
        <div className="flex flex-col justify-center items-center mx-5">
          <div className="">Do you want to beg or stand?</div>
          <div className='w-full flex flex-row justify-center gap-5'>
            <Button className='blue-button mt-5' onClick={() => socket?.emit('begResponse', { ...socketData, response: 'begged' })}>
              Beg
            </Button>

            <Button className='green-button mt-5' onClick={() => socket?.emit('begResponse', { ...socketData, response: 'stand' })}>
              Stand
            </Button>
          </div>
        </div>
      </Modal>


      <Modal open={begResponseModalVisible} closeOnDocumentClick={false} onClose={() => setBegResponseModalVisible(false)} contentStyle={isForceStandCardInHand ? { width: '30em' } : undefined}>
        <div className="flex flex-col justify-center items-center mx-5">
          <div className="">{turnPlayerData?.nickname} has begged!</div>
          <div className='w-full flex flex-row justify-center gap-5'>
            <Button className='blue-button mt-5' onClick={() => socket?.emit('begResponse', { ...socketData, response: 'give' })}>
              {
                isForceStandCardInHand ? 'Force stand' : 'Give one'
              }

            </Button>

            <Button className='green-button mt-5' onClick={() => socket?.emit('begResponse', { ...socketData, response: 'run' })}>
              Run pack
            </Button>
          </div>
          {
            isForceStandCardInHand ? <div className='text-gray-500 mt-3 text-sm italic text-center'>You have a card in your hand that allows you to force your opponent to stand without giving them a point</div> : undefined
          }

        </div>
      </Modal>

      <Modal open={waitingBegResponseModalVisible} closeOnDocumentClick={false} onClose={() => setWaitingBegResponseModalVisible(false)}>
        <div className="flex flex-col justify-center items-center mx-5">
          <div className="">Waiting for response from {dealerData?.nickname}...</div>
        </div>
      </Modal>

      <Modal open={redealModalVisible} closeOnDocumentClick={false} onClose={() => setBegResponseModalVisible(false)}>
        <div className="flex flex-col justify-center items-center mx-5">
          <div className="">The deck has run out of cards and must be redealt!</div>
          <div className='w-full flex flex-row justify-center gap-5'>
            <Button className='blue-button mt-5' onClick={() => socket?.emit('redeal', socketData)}>
              Redeal
            </Button>
          </div>
        </div>
      </Modal>

      <Modal className='top-modal' contentStyle={{ width: 'fit-content' }} open={isTargettingLift} closeOnDocumentClick={false}>
        <div className="px-12">Choose a card in the lift to be powerless and worth 0 points</div>
        <div className='flex flex-row justify-center'>
          <Button className='red-button mt-5' onClick={() => { setIsTargettingLift(false); setPlayedCard(undefined); } }>
            Cancel
          </Button>
        </div>
      </Modal>

      <Modal className='top-modal' contentStyle={{ width: 'fit-content' }} open={isTargettingOppLift} closeOnDocumentClick={false}>
        <div className="px-12">Choose a card in the lift for the opponent to take back</div>
        <div className='flex flex-row justify-center'>
          <Button className='red-button mt-5' onClick={() => { setIsTargettingOppLift(false); setPlayedCard(undefined); }}>
            Cancel
          </Button>
        </div>
      </Modal>


      <Modal contentStyle={{ width: 'fit-content' }} open={oppSelectionModalVisible} closeOnDocumentClick={false}>
        <div className="px-12">Choose a card an an opponent to swap the card with</div>

        <div className='flex flex-row gap-5 justify-center mt-3'>
          <Button className={selectedOpp?.id == player2Data?.id ? 'blue-button' : 'white-button'} onClick={() => setSelectedOpp(player2Data)}>
            {player2Data.nickname}
          </Button>

          <Button className={selectedOpp?.id == player4Data?.id ? 'blue-button' : 'white-button'} onClick={() => setSelectedOpp(player4Data)}>
            {player4Data.nickname}
          </Button>
        </div>

          { selectedCard &&
            <div>
              <div className='flex flex-row justify-center mt-3'>
                <PlayingCard
                  key={'swap-card'}
                  cardData={selectedCard}
                  isDeckCard={false}
                  isNotPlayable
                />
              </div>

              { selectedOpp &&
                <div className='mt-3 text-bold text-center text-lg text-blue-500'>Swapping this card with a random card from {selectedOpp.nickname}'s hand</div>
              }
            </div>
          }

        <div className='flex flex-row gap-5 justify-center'>
          <Button disabled={!(selectedCard && selectedOpp)} className='green-button mt-5' onClick={() => { handleOppSelectionConfirm(); }}>
            Confirm
          </Button>

          <Button className='red-button mt-5' onClick={() => { handleOppSelectionClose(); }}>
            Cancel
          </Button>
        </div>
      </Modal>



      {/* -----------------------------------------------------------*/}

    </div>
  );
}