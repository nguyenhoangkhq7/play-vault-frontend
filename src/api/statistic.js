import {API_BASE_URL} from "../config/api.js"


const API_URL = `${API_BASE_URL}/monthly_statistic`;
const PURCHASES_URL = `${API_BASE_URL}/purchases`;
const WISHLIST_URL = `${API_BASE_URL}/wishlist`;
const USERS_URL = `${API_BASE_URL}/users`;
const GAMES_URL = `${API_BASE_URL}/games`;
const COMMENTS_URL = `${API_BASE_URL}/comments`;

// Helper to check if a date is in the specified month and year
const isInMonth = (dateString, year, month) => {
  if (!dateString) return false;
  const date = typeof dateString === 'object' && dateString.$date
    ? new Date(dateString.$date)
    : new Date(dateString);
  if (isNaN(date.getTime())) return false;
  return date.getFullYear() === year && date.getMonth() === month;
};

// Helper to get current month and year
const getCurrentMonthYear = () => {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth(),
    formatted: `${today.getMonth() + 1}-${today.getFullYear()}`,
  };
};

// Helper to get previous month and year
const getPreviousMonthYear = () => {
  const today = new Date();
  today.setMonth(today.getMonth() - 1);
  return {
    year: today.getFullYear(),
    month: today.getMonth(),
    formatted: `${today.getMonth() + 1}-${today.getFullYear()}`,
  };
};

// Helper to check if today is the last day of the month
const isLastDayOfMonth = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return tomorrow.getDate() === 1;
};

// Fetch monthly statistics
export async function fetchMonthlyStatistics() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch statistics: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return [];
  }
}

// Create new monthly statistics (POST)
export async function createMonthlyStatistics(statistics) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statistics),
    });
    if (!response.ok) {
      throw new Error(`Failed to create statistics: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating statistics:', error);
    throw error;
  }
}

// Update existing monthly statistics (PUT)
export async function updateMonthlyStatistics(id, statistics) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statistics),
    });
    if (!response.ok) {
      throw new Error(`Failed to update statistics ${id}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating statistics ${id}:`, error);
    throw error;
  }
}

// Calculate live statistics for the current month
export async function calculateCurrentStatistics() {
  try {
    const { year, month, formatted } = getCurrentMonthYear();

    // Fetch raw data
    const [purchases, wishlist, users, games, comments] = await Promise.all([
      fetch(PURCHASES_URL).then(res => res.json()).catch(() => []),
      fetch(WISHLIST_URL).then(res => res.json()).catch(() => []),
      fetch(USERS_URL).then(res => res.json()).catch(() => []),
      fetch(GAMES_URL).then(res => res.json()).catch(() => []),
      fetch(COMMENTS_URL).then(res => res.json()).catch(() => []),
    ]);

    // Debug: Log raw data counts
    console.log('Raw data:', {
      purchases: purchases.length,
      wishlist: wishlist.length,
      users: users.length,
      games: games.length,
      comments: comments.length,
    });

    // Filter users for the current month based on created_at
    const currentUsers = users.filter(u =>
      u.created_at && isInMonth(u.created_at, year, month)
    );

    // Filter purchases for the current month based on purchased_at
    const currentPurchases = purchases
      .map(purchase => ({
        ...purchase,
        games_purchased: purchase.games_purchased?.filter(gp =>
          gp.purchased_at && isInMonth(gp.purchased_at, year, month)
        ) || [],
      }))
      .filter(purchase => purchase.games_purchased?.length > 0);

    // Process purchases
    let revenue = 0;
    const purchaseCounts = {};
    const uniqueBuyers = new Set();

    currentPurchases.forEach(purchase => {
      uniqueBuyers.add(purchase.user_id);
      purchase.games_purchased.forEach(gp => {
        revenue += gp.price || 0;
        purchaseCounts[gp.game_id] = (purchaseCounts[gp.game_id] || 0) + 1;
      });
    });

    // Process wishlist
    const wishlistCounts = {};
    wishlist.forEach(w => {
      if (w.fav_game_id) {
        w.fav_game_id.forEach(gameId => {
          wishlistCounts[gameId] = (wishlistCounts[gameId] || 0) + 1;
        });
      }
    });

    // Process comments
    const currentComments = comments.filter(c =>
      c.commented_date && isInMonth(c.commented_date, year, month) && c.comment
    );

    // Calculate statistics
    const num_of_user = currentUsers.length;
    const num_of_interaction = currentComments.length + currentPurchases.reduce(
      (acc, purchase) => acc + purchase.games_purchased.length,
      0
    ) + wishlist.filter(w => isInMonth(w.created_at, year, month)).length;
    const avg_cus_spend = uniqueBuyers.size > 0 ? Math.round(revenue / uniqueBuyers.size) : 0;

    // Top purchased games
    const topPurchasedGames = Object.entries(purchaseCounts)
      .map(([game_id, purchaseCount]) => {
        const game = games.find(g => g.id === game_id.toString());
        return {
          id: game_id,
          name: game ? game.name : 'Unknown',
          purchaseCount,
        };
      })
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 5);

    // Top commented games
    const commentCounts = {};
    const commentDetails = {};
    currentComments.forEach(comment => {
      const gameId = comment.game_id;
      commentCounts[gameId] = (commentCounts[gameId] || 0) + 1;
      if (!commentDetails[gameId]) commentDetails[gameId] = [];
      commentDetails[gameId].push({
        user_id: comment.user_id,
        rating: comment.rating,
        comment: comment.comment,
        commented_date: comment.commented_date,
      });
    });
    const topCommentedGames = Object.entries(commentCounts)
      .map(([game_id, commentCount]) => {
        const game = games.find(g => g.id === game_id.toString());
        return {
          id: game_id,
          name: game ? game.name : 'Unknown',
          commentCount,
          comments: commentDetails[game_id] || [],
        };
      })
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 5);

    // Collect all comments for the current month
    const allComments = currentComments.map(c => ({
      game_id: c.game_id,
      user_id: c.user_id,
      rating: c.rating,
      comment: c.comment,
      commented_date: c.commented_date,
    }));

    // Debug: Log calculated statistics
    console.log('Calculated statistics:', {
      time: formatted,
      revenue,
      num_of_user,
      num_of_interaction,
      avg_cus_spend,
      top_purchased_games: topPurchasedGames,
      top_commented_games: topCommentedGames,
      all_comments: allComments,
    });

    return {
      time: formatted,
      revenue,
      num_of_user,
      num_of_interaction,
      avg_cus_spend,
      top_purchased_games: topPurchasedGames,
      top_commented_games: topCommentedGames,
      all_comments: allComments,
    };
  } catch (error) {
    console.error('Error calculating current statistics:', error);
    return {
      time: getCurrentMonthYear().formatted,
      revenue: 0,
      num_of_user: 0,
      num_of_interaction: 0,
      avg_cus_spend: 0,
      top_purchased_games: [],
      top_commented_games: [],
      all_comments: [],
    };
  }
}

// Get previous month statistics
export async function getPreviousStatistics() {
  try {
    const stats = await fetchMonthlyStatistics();
    const { formatted } = getPreviousMonthYear();
    const previous = stats.find(s => s.time === formatted) || {
      revenue: 0,
      num_of_user: 0,
      num_of_interaction: 0,
      avg_cus_spend: 0,
      top_purchased_games: [],
      top_commented_games: [],
    };
    return previous;
  } catch (error) {
    console.error('Error fetching previous statistics:', error);
    return {
      revenue: 0,
      num_of_user: 0,
      num_of_interaction: 0,
      avg_cus_spend: 0,
      top_purchased_games: [],
      top_commented_games: [],
    };
  }
}

// Auto-save statistics on the last day of the month
export async function autoSaveStatistics() {
  if (!isLastDayOfMonth()) return;

  try {
    const stats = await fetchMonthlyStatistics();
    const currentStats = await calculateCurrentStatistics();
    const existingStat = stats.find(s => s.time === currentStats.time);

    // Remove all_comments from stats to avoid saving large data
    const { all_comments, ...statsToSave } = currentStats;

    if (existingStat) {
      await updateMonthlyStatistics(existingStat.id, statsToSave);
      console.log(`Statistics for ${currentStats.time} updated successfully!`);
    } else {
      const newStat = {
        ...statsToSave,
        id: String(stats.length + 1),
      };
      await createMonthlyStatistics(newStat);
      console.log(`Statistics for ${currentStats.time} saved successfully!`);
    }
  } catch (error) {
    console.error('Error auto-saving statistics:', error);
  }
}