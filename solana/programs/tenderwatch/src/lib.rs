use anchor_lang::prelude::*;

declare_id!("DdtdAXMCaS4kToB1eXH2KtqDWmDiFrGj89KkAoKbPr3F");

/// Number of agreeing votes required to resolve a flag.
/// The frontend maintains a verifier allowlist; on-chain any
/// signed wallet may vote (verifier NFT gate is a v2 feature).
const VOTE_THRESHOLD: u8 = 3;
const MAX_VOTERS: usize = 16;

#[program]
pub mod tenderwatch {
    use super::*;

    /// Citizens call this to flag a tender as suspicious.
    /// Creates a PDA: seeds = ["flag", tender_id, flagger_pubkey]
    pub fn flag_tender(
        ctx: Context<FlagTender>,
        tender_id: String,
        reason_hash: [u8; 32],
    ) -> Result<()> {
        require!(tender_id.len() <= 32, TenderError::TenderIdTooLong);
        let flag = &mut ctx.accounts.flag;
        flag.tender_id = tender_id;
        flag.flagger = ctx.accounts.flagger.key();
        flag.reason_hash = reason_hash;
        flag.created_at = Clock::get()?.unix_timestamp;
        flag.legit_votes = 0;
        flag.spam_votes = 0;
        flag.voters = Vec::new();
        flag.status = FlagStatus::Pending;
        Ok(())
    }

    /// Verifiers call this to vote on a pending flag.
    /// Any signed wallet may vote (frontend enforces allowlist via store.ts).
    /// Production v2: replace with Metaplex credential NFT check.
    pub fn vote_on_flag(ctx: Context<VoteOnFlag>, verdict: Verdict) -> Result<()> {
        let verifier = ctx.accounts.verifier.key();
        let flag = &mut ctx.accounts.flag;

        require!(
            flag.status == FlagStatus::Pending,
            TenderError::FlagAlreadyResolved
        );
        require!(!flag.voters.contains(&verifier), TenderError::AlreadyVoted);
        require!(flag.voters.len() < MAX_VOTERS, TenderError::VoterListFull);

        flag.voters.push(verifier);
        match verdict {
            Verdict::Legitimate => flag.legit_votes += 1,
            Verdict::Spam => flag.spam_votes += 1,
        }

        if flag.legit_votes >= VOTE_THRESHOLD {
            flag.status = FlagStatus::VerifiedSuspicious;
        } else if flag.spam_votes >= VOTE_THRESHOLD {
            flag.status = FlagStatus::DismissedAsSpam;
        }
        Ok(())
    }
}

#[account]
pub struct Flag {
    pub tender_id: String,   // up to 32 bytes
    pub flagger: Pubkey,     // 32
    pub reason_hash: [u8; 32], // 32
    pub created_at: i64,     // 8
    pub legit_votes: u8,     // 1
    pub spam_votes: u8,      // 1
    pub voters: Vec<Pubkey>, // 4 + 32*MAX_VOTERS
    pub status: FlagStatus,  // 1
}

impl Flag {
    pub const SIZE: usize = 4 + 32 + 32 + 32 + 8 + 1 + 1 + 4 + (32 * MAX_VOTERS) + 1;
}

#[derive(Accounts)]
#[instruction(tender_id: String)]
pub struct FlagTender<'info> {
    #[account(
        init,
        payer = flagger,
        space = 8 + Flag::SIZE,
        seeds = [b"flag", tender_id.as_bytes(), flagger.key().as_ref()],
        bump
    )]
    pub flag: Account<'info, Flag>,
    #[account(mut)]
    pub flagger: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteOnFlag<'info> {
    #[account(mut)]
    pub flag: Account<'info, Flag>,
    pub verifier: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum FlagStatus {
    Pending,
    VerifiedSuspicious,
    DismissedAsSpam,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Verdict {
    Legitimate,
    Spam,
}

#[error_code]
pub enum TenderError {
    #[msg("Tender ID exceeds 32 bytes")]
    TenderIdTooLong,
    #[msg("This flag has already been resolved")]
    FlagAlreadyResolved,
    #[msg("This wallet has already voted on this flag")]
    AlreadyVoted,
    #[msg("Voter list is full")]
    VoterListFull,
}
