// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @notice Stakeable is a contract who is ment to be inherited by other contract that wants Staking capabilities
 */
contract Stakeable {
    /**
     * @notice Constructor since this contract is not ment to be used without inheritance
     * push once to stakeholders for it to work proplerly
     */
    constructor() {
        // This push is needed so we avoid index 0 causing bug of index-1
        stakeholders.push();
    }

    /**
     * @notice
     * A stake struct is used to represent the way we store stakes,
     * A Stake will contain the users address, the amount staked and a timestamp,
     * Since which is when the stake was made
     * @param method is staking method
     * 1 : 6 months staking
     * 2 : 12 months staking
     * 3 : 18 months staking
     * 4 : 24 months staking
     */
    struct Stake {
        address user;
        uint256 amount;
        uint256 since;
        // This claimable field is new and used to tell how big of a reward is currently available
        uint256 claimable;
        uint8 method;
    }
    /**
     * @notice Stakeholder is a staker that has active stakes
     */
    struct Stakeholder {
        address user;
        Stake[] address_stakes;
    }
    /**
     * @notice
     * StakingSummary is a struct that is used to contain all stakes performed by a certain account
     */
    struct StakingSummary {
        uint256 total_amount;
        uint256 total_reward;
        Stake[] stakes;
    }

    /**
     * @notice
     *   This is a array where we store all Stakes that are performed on the Contract
     *   The stakes for each address are stored at a certain index, the index can be found using the stakes mapping
     */
    Stakeholder[] internal stakeholders;
    /**
     * @notice
     * stakes is used to keep track of the INDEX for the stakers in the stakes array
     */
    mapping(address => uint256) internal stakes;
    /**
     * @notice Staked event is triggered whenever a user stakes tokens, address is indexed to make it filterable
     */
    event Staked(
        address indexed user,
        uint256 amount,
        uint256 index,
        uint256 timestamp,
        uint8 method
    );

    /**
		 * @notice
			rewardPerHour is 1000 because it is used to represent 0.001, since we only use integer numbers
			This will give users 0.0004% reward for each staked token / H
		 */
    uint256 internal rewardPerMonthlyRate = 103;

    /**
     * @notice _addStakeholder takes care of adding a stakeholder to the stakeholders array
     */
    function _addStakeholder(address staker) internal returns (uint256) {
        // Push a empty item to the Array to make space for our new stakeholder
        stakeholders.push();
        // Calculate the index of the last item in the array by Len-1
        uint256 userIndex = stakeholders.length - 1;
        // Assign the address to the new index
        stakeholders[userIndex].user = staker;
        // Add index to the stakeHolders
        stakes[staker] = userIndex;
        return userIndex;
    }

    /**
     * @notice
     * _Stake is used to make a stake for an sender. It will remove the amount staked from the stakers account and place those tokens inside a stake container
     * StakeID
     */
    function _stake(
        uint256 _amount,
        address account,
        uint8 method
    ) internal {
        // Simple check so that user does not stake 0
        require(_amount > 0, "Cannot stake nothing");

        // Mappings in solidity creates all values, but empty, so we can just check the address
        uint256 index = stakes[account];
        // block.timestamp = timestamp of the current block in seconds since the epoch
        uint256 timestamp = block.timestamp;
        // See if the staker already has a staked index or if its the first time
        if (index == 0) {
            // This stakeholder stakes for the first time
            // We need to add him to the stakeHolders and also map it into the Index of the stakes
            // The index returned will be the index of the stakeholder in the stakeholders array
            index = _addStakeholder(account);
        }

        // Use the index to push a new Stake
        // push a newly created Stake with the current block timestamp.
        stakeholders[index].address_stakes.push(
            Stake(account, _amount, timestamp, 0, method)
        );
        // Emit an event that the stake has occured
        emit Staked(account, _amount, index, timestamp, method);
    }

    /**
     * @notice
     * calculateStakeReward is used to calculate how much a user should be rewarded for their stakes
     * and the duration the stake has been active
     * Staking reward calculation
     */
    function calculateStakeReward(Stake memory _current_stake)
        internal
        view
        returns (uint256)
    {
        uint256 _reward;

        // 6 Month - 12%
        // 12 Month - 30%
        // 18 Month - 45%
        // 24 Months - 70%

        uint256 _months = (block.timestamp - _current_stake.since) / 30 days;

        // Calculation of the rewards according to staking method
        // 1 : 6 months staking method
        // 2 : 12 months staking method
        // 3 : 18 months staking method
        // 4 : 24 months staking method
        if (_current_stake.method == 1) {
            if (_months > 6) _months = 6;
            _reward = (_current_stake.amount * 12 * _months) / 100 / 6;
        } else if (_current_stake.method == 2) {
            if (_months > 12) _months = 12;
            _reward = (_current_stake.amount * 30 * _months) / 100 / 12;
        } else if (_current_stake.method == 3) {
            if (_months > 18) _months = 18;
            _reward = (_current_stake.amount * 45 * _months) / 100 / 18;
        } else {
            if (_months > 24) _months = 24;
            _reward = (_current_stake.amount * 70 * _months) / 100 / 24;
        }
        return _reward;
    }

    /**
     * @notice
     * withdrawStake takes in an amount and a index of the stake and will remove tokens from that stake
     * Notice index of the stake is the users stake counter, starting at 0 for the first stake
     * Will return the amount to MINT onto the acount
     * Will also calculateStakeReward and reset timer
     */
    function _withdrawStake(
        uint256 amount,
        uint256 index,
        address account
    ) internal {
        // Grab user_index which is the index to use to grab the Stake[]
        uint256 user_index = stakes[account];
        Stake memory current_stake = stakeholders[user_index].address_stakes[
            index
        ];
        require(
            current_stake.amount >= amount,
            "Staking: Cannot withdraw more than you have staked"
        );

        // Remove by subtracting the money unstaked

        if (current_stake.amount + current_stake.claimable == amount) {
            current_stake.amount = 0;
            delete stakeholders[user_index].address_stakes[index];
        } else {
            // If not empty then replace the value of it
            uint256 replaceAmount;
            // 1 : 6 months staking method
            // 2 : 12 months staking method
            // 3 : 18 months staking method
            // 4 : 24 months staking method
            if (current_stake.method == 1) {
                replaceAmount = (amount * 100) / (100 + 12);
            } else if (current_stake.method == 2) {
                replaceAmount = (amount * 100) / (100 + 30);
            } else if (current_stake.method == 3) {
                replaceAmount = (amount * 100) / (100 + 45);
            } else {
                replaceAmount = (amount * 100) / (100 + 70);
            }
            current_stake.amount -= replaceAmount;
            stakeholders[user_index]
                .address_stakes[index]
                .amount = current_stake.amount;
        }
    }

    /**
     * @notice
     * hasStake is used to check if a account has stakes and the total amount along with all the seperate stakes
     */
    function hasStake(address _staker)
        public
        view
        returns (StakingSummary memory)
    {
        // totalStakeAmount is used to count total staked amount of the address
        uint256 totalStakeAmount;
        uint256 totalRewardAmount;
        // Keep a summary in memory since we need to calculate this
        StakingSummary memory summary = StakingSummary(
            0,
            0,
            stakeholders[stakes[_staker]].address_stakes
        );
        // Itterate all stakes and grab amount of stakes
        for (uint256 s = 0; s < summary.stakes.length; s += 1) {
            uint256 availableReward = calculateStakeReward(summary.stakes[s]);
            summary.stakes[s].claimable = availableReward;
            totalRewardAmount = totalRewardAmount + availableReward;
            totalStakeAmount = totalStakeAmount + availableReward;
        }
        // Assign calculate amount to summary
        summary.total_amount = totalStakeAmount;
        summary.total_reward = totalRewardAmount;
        return summary;
    }
}
