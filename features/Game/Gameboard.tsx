import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DeckCard } from '../../models/DeckCard';
import PlayingCard from './PlayingCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getActiveAbilities, getBeg, getDealer, getDoubleLiftCards, getDoubleLiftModalVisible, getLift, getLiftWinner, getMatchWinner, getMessage, getMobileView, getPlayerCards, getPlayerJoinedRoom, getPlayerList, getPlayerStatus, getRoundWinners, getTeammateCards, getTurn, setDoubleLiftModalVisible, setMessage } from '../../slices/game.slice';
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
import PlayerStatusIcons from './PlayerStatusIcons';
import { IoMdEye, IoMdSwap } from 'react-icons/io';
import LoadingIcon from './LoadingIcon';
import ActiveAbilities from './ActiveAbilities';
import Chatbox from './Chatbox';
import MobileGameInfo from './MobileGameInfo';
import { IoChatbox, IoEye } from 'react-icons/io5';
import SettingsModal from './Modals/SettingsModal';
import LeaveConfirmModal from './Modals/LeaveConfirmModal';
import AllyCardsModal from './Modals/AllyCardsModal';


interface Props {
  roomId?: string;
}


export default function Gameboard({ roomId }: Props) {

  const router = useRouter();

  const dispatch = useAppDispatch();

  const mobileView = useAppSelector(getMobileView);

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

  const doubleLiftCards = useAppSelector(getDoubleLiftCards);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cards in the hand of the client player
  const playerCards = useAppSelector(getPlayerCards);

  // Cards in the hand of the client player's teammate
  const teammateCards = useAppSelector(getTeammateCards);

  // Modal visibility
  const [begModalVisible, setBegModalVisible] = useState<boolean>(false);
  const [begResponseModalVisible, setBegResponseModalVisible] = useState<boolean>(false);
  const [waitingBegResponseModalVisible, setWaitingBegResponseModalVisible] = useState<boolean>(false);
  const [redealModalVisible, setRedealModalVisible] = useState<boolean>(false);
  const [roundWinnersModalVisible, setRoundWinnersModalVisible] = useState<boolean>(false);
  const [oppSelectionModalVisible, setOppSelectionModalVisible] = useState<boolean>(false);
  const [chooseStarterModalVisible, setChooseStarterModalVisible] = useState<boolean>(false);
  const [allySelectionModalVisible, setAllySelectionModalVisible] = useState<boolean>(false);
  const [swapHandsModalVisible, setSwapHandsModalVisible] = useState<boolean>(false);

  const doubleLiftModalVisible = useAppSelector(getDoubleLiftModalVisible);

  // Selected opponent when choosing opponent from ability
  const [selectedOpp, setSelectedOpp] = useState<PlayerSocket>();

  // Selected card when choosing card from hand from ability
  const [selectedCard, setSelectedCard] = useState<DeckCard>();

  // Selected card when choosing card from ally's hand from ability
  const [selectedAllyCard, setSelectedAllyCard] = useState<DeckCard>();

  // If a card ability allows the player to target a card in the lift
  const [isTargettingLift, setIsTargettingLift] = useState<boolean>(false);

  // If a card ability allows the player to target an opponent's card in the lift
  const [isTargettingOppLift, setIsTargettingOppLift] = useState<boolean>(false);

  // Card that a player played which triggered a target ability
  const [playedCard, setPlayedCard] = useState<DeckCard>();

  // Store round winners in a state to keep round winners stored in case it is wiped from server
  const [roundWinnersStored, setRoundWinnersStored] = useState<RoundWinners>();

  // If looking at teammate's cards face up
  const [isTeammateCardsVisible, setIsTeammateCardsVisible] = useState<boolean>(false);

  // When chat icon is clicked in mobile view
  const [isChatboxExpand, setIsChatboxExpand] = useState<boolean>(false);



  // React refs for player hand div
  const player1Hand = useRef<HTMLDivElement>(null);
  const player2Hand = useRef<HTMLDivElement>(null);
  const player3Hand = useRef<HTMLDivElement>(null);
  const player4Hand = useRef<HTMLDivElement>(null);

  // React states to manage what cards players have
  const [player1Cards, setPlayer1Cards] = useState<DeckCard[]>([]);
  const [player3Cards, setPlayer3Cards] = useState<DeckCard[]>([]);

  const [player1Data, setPlayer1Data] = useState<PlayerSocket>({});
  const [player2Data, setPlayer2Data] = useState<PlayerSocket>({});
  const [player3Data, setPlayer3Data] = useState<PlayerSocket>({});
  const [player4Data, setPlayer4Data] = useState<PlayerSocket>({});

  // Data to send to socket
  const socketData = useMemo(() => {
    // Get ID stored in local storage, otherwise set it
    let localId = typeof window !== 'undefined' ? localStorage.getItem('socketId') ?? undefined : undefined;

    if (!localId && socket?.id) {
      localStorage.setItem('socketId', socket.id);
      localId = socket.id;
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
      if (el?.ability == CardAbilities.forceStand) {
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
    const areAbilitiesDisabled = activeAbilities?.includes(CardAbilities.abilitiesDisabled);

    if (!card.playable) {
      return;
    }

    if (!areAbilitiesDisabled) {
      if (card.ability == CardAbilities.swapOppCard) {
        if (player2Data.numCards && player4Data.numCards && player1Cards?.length && player1Cards.length != 1 && player2Data.numCards != 0 && player4Data.numCards != 0) {
          setOppSelectionModalVisible(true);
          setPlayedCard(card);
          return;
        }
      }

      if (card.ability == CardAbilities.swapAllyCard) {
        if (player3Data.numCards && player1Cards?.length && player1Cards.length != 1 && player3Data.numCards != 0) {
          setAllySelectionModalVisible(true);
          setPlayedCard(card);
          return;
        }
      }

      if (card.ability == CardAbilities.targetPowerless) {
        if (lift && lift.length != 0) {
          setIsTargettingLift(true);
          setPlayedCard(card);
          return;
        }
      }

      if (card.ability == CardAbilities.oppReplay) {
        if (lift && lift.length != 0) {
          setIsTargettingOppLift(true);
          setPlayedCard(card);
          return;
        }
      }

      if (card.ability == CardAbilities.chooseStarter) {
        if (player1Cards?.length > 1) {
          setChooseStarterModalVisible(true);
          setPlayedCard(card);
          return;
        }
      }

      if (card.ability == CardAbilities.swapHands) {
        if (player1Cards?.length > 1) {
          setSwapHandsModalVisible(true);
          setPlayedCard(card);
          return;
        }
      }

    }


    socket.emit('playCard', { ...socketData, card: { ...card, ability: areAbilitiesDisabled ? undefined : card.ability }, player: playerNumber });
  }

  function handleLiftCardClick(card: DeckCard) {

    if (isTargettingLift) {
      socket.emit('targetPowerless', { ...socketData, card: card, player: playerNumber, playedCard: playedCard });
    }
    else if (isTargettingOppLift) {
      socket.emit('oppReplay', { ...socketData, card: card, player: playerNumber, playedCard: playedCard });
    }

  }

  function handleSelectCard(card: DeckCard) {
    if (card.suit == playedCard.suit && card.value == playedCard.value) {
      return;
    }

    setSelectedCard(card);
  }

  function handleSelectAllyCard(card: DeckCard) {
    setSelectedAllyCard(card);
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

  function handleAllySelectionConfirm() {
    socket.emit('swapAllyCard', { ...socketData, card: selectedCard, allyCard: selectedAllyCard, player: playerNumber, playedCard: playedCard, });
    handleAllySelectionClose();
  }

  function handleAllySelectionClose() {
    setAllySelectionModalVisible(false);
    setPlayedCard(undefined);
    setSelectedCard(undefined);
    setSelectedAllyCard(undefined);
  }

  function handleChooseStarterConfirm() {
    socket.emit('chooseStarter', { ...socketData, player: playerNumber, target: selectedOpp, playedCard: playedCard });
    handleChooseStarterModalClose();
  }

  function handleChooseStarterModalClose() {
    setChooseStarterModalVisible(false);
    setPlayedCard(undefined);
    setSelectedOpp(undefined);
  }

  function handleSwapHandsConfirm() {
    socket.emit('swapHands', { ...socketData, player: playerNumber, target: selectedOpp, playedCard: playedCard });
    handleSwapHandsModalClose();
  }

  function handleSwapHandsModalClose() {
    setSwapHandsModalVisible(false);
    setPlayedCard(undefined);
    setSelectedOpp(undefined);
  }

  useEffect(() => {
    displayPlayerCards(playerCards ?? []);
  }, [playerCards]);

  useEffect(() => {
    setPlayer3Cards(teammateCards ?? []);
  }, [teammateCards]);


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

    if (roomId) {
      setIsLoading(false);
    }
  }, [matchWinner, roomId]);

  return (
    <div className="h-screen w-screen">

      <div className={`flex ${mobileView ? 'flex-col' : 'flex-row'}`}>

        {mobileView ?
          <div className='h-[15vh]'>
            <MobileGameInfo playerTeam={player1Data.team} socketData={socketData} />
          </div> :
          <div className='w-1/5'>
            <GameInfo playerTeam={player1Data.team} socketData={socketData} />
          </div>
        }

        <div className={`board-bg flex flex-col justify-between  ${mobileView ? 'h-[70vh] w-full' : 'h-screen w-4/5'}`}>
          {
            isLoading ?
              <div className='w-full h-full flex justify-center items-center'>
                <LoadingIcon />
              </div>
              :
              <>

                {/* ------------------------ Player 3 Info  ------------------------*/}
                <div className={`${mobileView ? 'h-1/5' : 'h-1/4'} flex flex-col justify-between items-center`}>
                  <div className='flex flex-row w-full justify-center gap-5 items-center'>

                    <div className='mx-2'>
                      {
                        mobileView &&
                          <AllyCardsModal
                            disabled={!player3Cards.length || player3Cards?.length <= 0}
                            handleSelectAllyCard={handleSelectAllyCard}
                            name={player3Data.nickname}
                            cards={player3Cards}
                            allySelectionModalVisible={allySelectionModalVisible}
                          />
                      }
                    </div>

                    <div className={`flex flex-col items-center justify-center p-2 player-info player-3-info ${mobileView ? 'w-3/4' : 'w-1/2'}`}>
                      <div className={`flex justify-center ${player3Data.disconnected ? 'text-gray-400 italic' : 'text-white'}`}>
                        {
                          player3Data.nickname
                        }
                      </div>

                      <div className='flex flex-row gap-2'>
                        <DealerIcon active={dealerData && player3Data.id == dealerData.id} />
                        <TurnIcon active={turnPlayerData && player3Data.id == turnPlayerData.id} />
                        <PlayerStatusIcons playerStatus={player3Status} />
                      </div>
                    </div>
                  </div>

                  <div className='w-full flex flex-row justify-center items-center relative'>
                    <div className={`flex flex-row justify-center items-center relative ${player3Cards?.length > 0 ? 'left-5' : ''}`} ref={player3Hand}>
                      {
                        mobileView ? <></> :
                          Array.from({ length: player3Data?.numCards ?? 0 }, (_, k) => {
                            return (
                              <PlayingCard
                                key={'3' + k}
                                player={3}
                                cardData={player3Cards[k]}
                                isNotPlayable={!allySelectionModalVisible}
                                className='-mx-2 p-0'
                                spotlighted={allySelectionModalVisible}
                                glow={allySelectionModalVisible ? 'blue' : undefined}
                                onClickHandler={() => player3Cards.length == 0 ? undefined : allySelectionModalVisible ? handleSelectAllyCard(player3Cards[k]) : undefined}
                                flipped={!(isTeammateCardsVisible || allySelectionModalVisible)}
                                spin={player3Cards[k]?.spin}
                              />
                            );
                          })
                      }
                      <Marker dispatchFunction={setPlayer3HandPos} />
                    </div>

                    { player3Cards?.length > 0 && !mobileView &&
                      <div className='flex justify-center items-center relative left-10'>
                        <Button
                          className='blue-button blue-outline'
                          iconClassName=''
                          icon={<IoMdEye />}
                          onClick={() => setIsTeammateCardsVisible((prev) => !prev)}
                        />
                      </div>
                    }
                  </div>
                </div>
                {/* -----------------------------------------------------------------*/}




                <div className='flex flex-row items-center'>
                  {/* ------------------------ Player 4 Info  ------------------------*/}
                  <div className={`flex flex-col justify-center items-center ${mobileView ? 'w-1/3 h-3/4' : 'w-2/12 h-full'} player-info player-4-info`}>
                    <div className={`break-all px-2 text-center ${player4Data.disconnected ? 'text-gray-400 italic' : 'text-white'}`}>
                      {
                        player4Data.nickname
                      }
                      wwwwwwwwwwwwww
                    </div>

                    <div className='flex flex-row flex-wrap justify-center gap-2 px-2'>
                      <DealerIcon active={dealerData && player4Data.id == dealerData.id} />
                      <TurnIcon active={turnPlayerData && player4Data.id == turnPlayerData.id} />
                      <PlayerStatusIcons playerStatus={player4Status} />
                    </div>
                  </div>

                  <div className="w-1/6 flex flex-col items-center justify-center gap-0" ref={player4Hand}>
                    { mobileView ? <></> :
                      Array.from({ length: player4Data?.numCards ?? 0 }, (_, k) => (
                        <PlayingCard
                          key={'4' + k}
                          player={4}
                          isDeckCard
                          className='rotate-90 p-0'
                          style={getTeam2CardMargins(player4Data?.numCards ?? 0)}
                          spin={k < player4Data?.spin}
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

                      {
                        mobileView ? <div className='w-5'></div>:
                          <div className='w-32 px-2 flex flex-wrap justify-center items-center gap-2'>
                            <ActiveAbilities />
                          </div>
                      }

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
                  <div className="w-1/6 flex flex-col items-center justify-center gap-0" ref={player2Hand}>
                    { mobileView ? <></> :
                      Array.from({ length: player2Data?.numCards ?? 0 }, (_, k) => (
                        <PlayingCard
                          key={'2' + k}
                          player={2}
                          isDeckCard
                          className='rotate-90 p-0'
                          style={getTeam2CardMargins(player2Data?.numCards ?? 0)}
                          spin={k < player2Data?.spin}
                        />
                      ))
                    }

                    <Marker dispatchFunction={setPlayer2HandPos} />
                  </div>
                  <div className={`flex flex-col justify-center items-center ${mobileView ? 'w-1/3 h-3/4' : 'w-2/12 h-full'} player-info player-2-info`}>
                    <div className={`break-all px-2 text-center ${player2Data.disconnected ? 'text-gray-400 italic' : 'text-white'} px-2`}>
                      {
                        player2Data.nickname
                      }
                      wwwwwwwwwwwwww
                    </div>

                    <div className='flex flex-row justify-center flex-wrap gap-2'>
                      <DealerIcon active={dealerData && player2Data.id == dealerData.id} />
                      <TurnIcon active={turnPlayerData && player2Data.id == turnPlayerData.id} />
                      <PlayerStatusIcons playerStatus={player2Status} />
                    </div>
                  </div>
                  {/* -----------------------------------------------------------------*/}
                </div>






                {/* ------------------------ Player 1 Info  ------------------------*/}
                <div className={`${mobileView ? 'h-1/2' : 'h-1/4'} gap-3 flex flex-col justify-end items-center`}>

                  <div className="w-full flex flex-row justify-center items-center" ref={player1Hand}>
                    {
                      Array.from({ length: player1Cards.length == 0 ? player1Data?.numCards ?? 0 : player1Cards.length}, (_, k) => {

                        const selectionActive = ((oppSelectionModalVisible || allySelectionModalVisible) && (!(player1Cards[k].suit == playedCard?.suit && player1Cards[k].value == playedCard?.value)));
                        return (
                          <PlayingCard
                            key={'1' + k}
                            player={1}
                            cardData={player1Cards[k]}
                            isDeckCard={player1Cards.length == 0 ? true : false}
                            onClickHandler={() => player1Cards.length == 0 ? undefined : selectionActive ? handleSelectCard(player1Cards[k]) : playCard(player1Cards[k])}
                            className='-mx-2'
                            spotlighted={selectionActive}
                            glow={selectionActive ? 'blue' : undefined}
                            spin={player1Cards[k]?.spin}
                          />
                        );}
                      )
                    }

                    <Marker dispatchFunction={setPlayer1HandPos} />
                  </div>

                  <div className='flex flex-row w-full justify-center gap-5 items-center'>
                    <div className='mx-2'>
                      {
                        mobileView ?
                          <Button
                            className='blue-button'
                            iconClassName='relative '
                            icon={<IoChatbox size={20} />}
                            tooltip='Chat'
                            tooltipAnchor='chat'
                            onClick={() => setIsChatboxExpand(true)}
                          /> : undefined
                      }
                    </div>

                    <div className={`flex flex-col items-center justify-center p-2 player-info player-1-info ${mobileView ? 'w-3/4' : 'w-1/2'}`}>

                      <div className='text-white'>
                        {
                          player1Data.nickname
                        }
                      </div>


                      <div className='flex flex-row gap-2'>
                        <DealerIcon active={dealerData && player1Data.id == dealerData.id}/>
                        <TurnIcon active={turnPlayerData && player1Data.id == turnPlayerData.id} />
                        <PlayerStatusIcons playerStatus={player1Status} />
                      </div>

                    </div>


                  </div>
                </div>
                {/* -----------------------------------------------------------------*/}
              </>
          }
        </div>

        { mobileView ?
          <div className='h-[15vh] info-bg'>
            <Chatbox socketData={socketData} hideInput expand={isChatboxExpand} setExpand={setIsChatboxExpand} isMobileChat/>
          </div>
          : <></>
        }


      </div>


      {/* ------------------------ Modals ------------------------*/}
      <SettingsModal roomId={socketData.roomId} />

      <LeaveConfirmModal socketData={socketData} />

      <RoundWinnersModal isVisible={roundWinnersModalVisible} setIsVisible={setRoundWinnersModalVisible} players={players} roundWinners={roundWinnersStored} />

      {/* ----- Beggar Beg Modal -----*/}
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

      {/* ----- Dealer Beg Modal -----*/}
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

      {/* ----- Waiting Beg Modal -----*/}
      <Modal open={waitingBegResponseModalVisible} closeOnDocumentClick={false} onClose={() => setWaitingBegResponseModalVisible(false)}>
        <div className="flex flex-col justify-center items-center mx-5">
          <div className="">Waiting for response from {dealerData?.nickname}...</div>
        </div>
      </Modal>

      {/* ----- Buss Pack Modal -----*/}
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

      {/* ----- targetPowerless Modal -----*/}
      <Modal className='top-modal' contentStyle={{ width: 'fit-content' }} open={isTargettingLift} closeOnDocumentClick={false}>
        <div className="px-12">Choose a card in the lift to be powerless and worth 0 points</div>
        <div className='flex flex-row justify-center'>
          <Button className='red-button mt-5' onClick={() => { setIsTargettingLift(false); setPlayedCard(undefined); } }>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* ----- oppReplay Modal -----*/}
      <Modal className='top-modal' contentStyle={{ width: 'fit-content' }} open={isTargettingOppLift} closeOnDocumentClick={false}>
        <div className="px-12">Choose a card in the lift for the opponent to take back</div>
        <div className='flex flex-row justify-center'>
          <Button className='red-button mt-5' onClick={() => { setIsTargettingOppLift(false); setPlayedCard(undefined); }}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* ----- swapOppCard Modal -----*/}
      <Modal contentStyle={{ width: 'fit-content' }} open={oppSelectionModalVisible} closeOnDocumentClick={false}>
        <div className="px-12">Choose a card an an opponent to swap the card with</div>

        <div className='flex flex-row gap-5 justify-center mt-3'>
          { player2Data.numCards != 0 &&
          <Button className={selectedOpp?.id == player2Data?.id ? 'blue-button' : 'white-button'} onClick={() => setSelectedOpp(player2Data)}>
            {player2Data.nickname}
          </Button>
          }

          { player4Data.numCards != 0 &&
          <Button className={selectedOpp?.id == player4Data?.id ? 'blue-button' : 'white-button'} onClick={() => setSelectedOpp(player4Data)}>
            {player4Data.nickname}
          </Button>
          }
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
                <div className='mt-3 text-bold text-center text-lg text-blue-500'>Swapping this card with a random card from {selectedOpp.nickname}&apos;s hand</div>
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


      {/* ----- swapAllyCard Modal -----*/}
      <Modal contentStyle={{ width: 'fit-content' }} open={allySelectionModalVisible} closeOnDocumentClick={false}>



        <div className='px-5'>
          <div className='flex flex-row justify-center items-center mt-3 gap-5'>
            <PlayingCard
              key={'swap-card'}
              cardData={selectedCard}
              isDeckCard={false}
              isOutline={!selectedCard}
              isNotPlayable
            />

            <IoMdSwap size={32}/>

            <PlayingCard
              key={'swap-card'}
              cardData={selectedAllyCard}
              isDeckCard={false}
              isOutline={!selectedAllyCard}
              isNotPlayable
            />
          </div>


          <div className='mt-3 text-bold text-center text-lg text-blue-500'>Swapping these two cards</div>

        </div>


        <div className='flex flex-row gap-5 justify-center'>
          <Button disabled={!(selectedCard && selectedAllyCard)} className='green-button mt-5' onClick={() => { handleAllySelectionConfirm(); }}>
            Confirm
          </Button>

          <Button className='red-button mt-5' onClick={() => { handleAllySelectionClose(); }}>
            Cancel
          </Button>
        </div>
      </Modal>


      {/* ----- chooseStarter Modal -----*/}
      <Modal contentStyle={{ width: 'fit-content' }} open={chooseStarterModalVisible} closeOnDocumentClick={false}>
        <div className="px-12">Choose who will play first next lift</div>

        <div className='flex flex-col gap-5 justify-center items-center mt-3 mx-5'>
          <Button className={(selectedOpp?.id == player1Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player1Data)}>
            {player1Data.nickname}
          </Button>

          <Button className={(selectedOpp?.id == player2Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player2Data)}>
            {player2Data.nickname}
          </Button>

          <Button className={(selectedOpp?.id == player3Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player3Data)}>
            {player3Data.nickname}
          </Button>

          <Button className={(selectedOpp?.id == player4Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player4Data)}>
            {player4Data.nickname}
          </Button>

        </div>

        <div className='flex flex-row gap-5 justify-center'>
          <Button disabled={!selectedOpp} className='green-button mt-5' onClick={() => { handleChooseStarterConfirm(); }}>
            Confirm
          </Button>

          <Button className='red-button mt-5' onClick={() => { handleChooseStarterModalClose(); }}>
            Cancel
          </Button>
        </div>
      </Modal>


      {/* ----- doubleLift Modal -----*/}
      <Modal contentStyle={{ width: 'fit-content' }} open={doubleLiftModalVisible} onClose={() => dispatch(setDoubleLiftModalVisible(false))} closeOnDocumentClick={true}>
        <div className="px-12">Cards that the winner of this lift will also win</div>

        <div className='grid grid-cols-4 gap-5 justify-center items-center mt-3 mx-5'>
          {
            Array.from({ length: doubleLiftCards?.length ?? 0 }, (_, k) => (
              <PlayingCard
                key={'dl' + k}
                cardData={doubleLiftCards[k]}
                isNotPlayable
                glow='none'
              />
            ))
          }

        </div>

        <div className='flex flex-row gap-5 justify-center'>
          <Button className='red-button mt-5' onClick={() => { dispatch(setDoubleLiftModalVisible(false)); }}>
            Close
          </Button>
        </div>
      </Modal>


      {/* ----- swapHands Modal -----*/}
      <Modal contentStyle={{ width: 'fit-content' }} open={swapHandsModalVisible} closeOnDocumentClick={false}>
        <div className="px-12">Choose the player you want to swap hands with</div>

        <div className='flex flex-col gap-5 justify-center items-center mt-3 mx-5'>

          <Button className={(selectedOpp?.id == player2Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player2Data)}>
            {player2Data.nickname}
          </Button>

          <Button className={(selectedOpp?.id == player3Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player3Data)}>
            {player3Data.nickname}
          </Button>

          <Button className={(selectedOpp?.id == player4Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player4Data)}>
            {player4Data.nickname}
          </Button>

        </div>

        <div className='flex flex-row gap-5 justify-center'>
          <Button disabled={!selectedOpp} className='green-button mt-5' onClick={() => { handleSwapHandsConfirm(); }}>
            Confirm
          </Button>

          <Button className='red-button mt-5' onClick={() => { handleSwapHandsModalClose(); }}>
            Cancel
          </Button>
        </div>
      </Modal>



      {/* -----------------------------------------------------------*/}

    </div>
  );
}