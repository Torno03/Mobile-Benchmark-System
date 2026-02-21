import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import './PhoneDetails.css';

const PhoneDetails = () => {
  const { phoneId } = useParams();
  const [phone, setPhone] = useState(null);
  const [oldPrice, setOldPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [averageRatings, setAverageRatings] = useState(null);
  const [ratingInput, setRatingInput] = useState({
    camera: 0,
    battery: 0,
    display: 0,
    processor: 0,
    comment: "",
  });
  const [hasRated, setHasRated] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedPhones, setRelatedPhones] = useState([]);

  const handleInputChange = (field, value) => {
    setRatingInput({ ...ratingInput, [field]: value });
  };

  const submitRating = async (e) => {
    e.preventDefault();

    const user = getAuth().currentUser;
    if (!user) {
      alert("You must be logged in to submit a rating");
      return;
    }

    try {
      await axios.post('http://localhost:1080/api/ratings/add', {
        phone: phoneId,
        user: user.uid,
        ratings: {
          camera: parseInt(ratingInput.camera),
          battery: parseInt(ratingInput.battery),
          display: parseInt(ratingInput.display),
          processor: parseInt(ratingInput.processor),
        },
        comment: ratingInput.comment,
      });
      setRatingInput({ camera: 0, battery: 0, display: 0, processor: 0, comment: "" });
      setRefresh(!refresh);
      setHasRated(true);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      alert("Rating submission failed");
    }
  };

  const handlePurchase = () => {
    if (!phone.purchaseLink) {
      alert('Purchase link not available for this product');
      return;
    }
    window.open(phone.purchaseLink, '_blank');
  };

  const fetchAverageRatings = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:1080/api/ratings/${phoneId}/average`);
      setAverageRatings(res.data);
    } catch (err) {
      setAverageRatings(null);
    }
  }, [phoneId]);

  const checkIfRated = useCallback(async () => {
    const user = getAuth().currentUser;

    if (!user) {
      setHasRated(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:1080/api/ratings/check/${phoneId}/${user.uid}`);
      setHasRated(res.data.hasRated);
    } catch (err) {
      console.error("Error checking if rated:", err);
    }
  }, [phoneId]);

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const res = await axios.get(`http://localhost:1080/api/phones/${phoneId}`);
        setPhone(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert('Failed to load phone details');
        setLoading(false);
      }
    };

    fetchPhone();
    checkIfRated();
  }, [phoneId, checkIfRated]);



  const postComment = async () => {
    const user = getAuth().currentUser
    if (!user || !newComment.trim()) return
    await axios.post(`http://localhost:1080/api/phones/${phoneId}/comments`, {
      user: user.uid,
      userName: user.displayName || user.email || 'Anonymous',
      content: newComment
    })
    setNewComment('')
    fetchComments()
  } 

  const fetchComments = useCallback(() => {
    axios.get(`/api/phones/${phoneId}/comments`)
      .then(res => setComments(res.data))
      .catch(console.error);
  }, [phoneId]);

  useEffect(() => {
    axios.get(`/api/phones/${phoneId}`)
      .then(res => setPhone(res.data))
      .catch(console.error);
    fetchComments();
  }, [phoneId, fetchComments]);

  useEffect(() => {
    fetchAverageRatings();
  }, [refresh, phoneId, fetchAverageRatings]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === phone.imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [phone, currentImageIndex]);

  useEffect(() => {
    fetch(`http://localhost:1080/api/phones/${phoneId}/related`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Related phones data:", data);
        setRelatedPhones(data || []); // Adjusted based on the data structure
      })
      .catch((err) => {
        console.error("Failed to fetch related phones:", err);
        setRelatedPhones([]); // Fallback to empty array
      });
  }, [phoneId]);

  const handleAddToWishlist = async () => {
    const user = getAuth().currentUser
    if (!user) return alert('Log in to add to wishlist')
    try {
      await axios.post('http://localhost:1080/api/wishlist/add', {
        user: user.uid,
        phone: phoneId
      })
      alert('Added to wishlist')
    } catch {
      alert('Failed to add')
    }
  }
  useEffect(() => {
    if (phone) setOldPrice(phone.price)
  }, [phone])

  useEffect(() => {
    if (!phoneId) return
    const intervalId = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:1080/api/phones/${phoneId}`)
        const latestPrice = res.data.price
        if (oldPrice !== null && latestPrice !== oldPrice) {
          alert(`Price changed: $${oldPrice} → $${latestPrice}`)
          setPhone(p => ({ ...p, price: latestPrice }))
          setOldPrice(latestPrice)
        }
      } catch (err) {
        console.error('Price check failed', err)
      }
    }, 60000)  // every 60s

    return () => clearInterval(intervalId)
  }, [phoneId, oldPrice])
  

  if (loading) return <p>Loading phone details...</p>;
  if (!phone) return <p>Phone not found.</p>;

  return (
    <div className="phone-details-container">
      <h2>{phone.name}</h2>

      <div className="phone-image-gallery">
        {phone.imageUrls && phone.imageUrls.length > 0 ? (
          <>
            <button className="prev-button" onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? phone.imageUrls.length - 1 : prevIndex - 1))}>
              &lt;
            </button>
            <img
              src={phone.imageUrls[currentImageIndex]}
              alt={`${phone.name} - ${currentImageIndex + 1}`}
              className="phone-details-image"
              onClick={() => window.open(phone.imageUrls[currentImageIndex], '_blank')}
            />
            <button className="next-button" onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex === phone.imageUrls.length - 1 ? 0 : prevIndex + 1))}>
              &gt;
            </button>
          </>
        ) : (
          <img
            src="https://via.placeholder.com/200"
            alt={phone.name}
            className="phone-details-image"
          />
        )}
      </div>

      <div className="image-navigation">
        {phone.imageUrls.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>

      <div className="phone-basic-info">
        <p><strong>Brand:</strong> {phone.brand}</p>
        <p><strong>Price:</strong> ${phone.price}</p>
        <button
          onClick={handlePurchase}
          className="purchase-button"
          disabled={!phone.purchaseLink}
        >
          Buy Now
        </button>
        <button onClick={handleAddToWishlist} className="wishlist-button">
          Add to Wishlist
        </button>
      </div>

      <div className="phone-features">
        <h3>Features</h3>
        <div className="feature-grid">
          {/* Camera */}
          <div className="feature-category">
            <div className="category-title">Camera</div>
            <div className="feature-row">
              <div className="feature-item">Main</div>
              <div className="feature-description">{phone.features?.camera?.main || 'N/A'} MP</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">UltraWide</div>
              <div className="feature-description">{phone.features?.camera?.ultraWide || 'N/A'} MP</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Front</div>
              <div className="feature-description">{phone.features?.camera?.front || 'N/A'} MP</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Video Recording</div>
              <div className="feature-description">{phone.features?.camera?.videoRecording || 'N/A'}</div>
            </div>
          </div>

          {/* Battery */}
          <div className="feature-category">
            <div className="category-title">Battery</div>
            <div className="feature-row">
              <div className="feature-item">Capacity</div>
              <div className="feature-description">{phone.features?.battery?.capacity || 'N/A'} mAh</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Charging Speed</div>
              <div className="feature-description">{phone.features?.battery?.chargingSpeed || 'N/A'} W</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Type</div>
              <div className="feature-description">{phone.features?.battery?.type || 'N/A'}</div>
            </div>
          </div>

          {/* Display */}
          <div className="feature-category">
            <div className="category-title">Display</div>
            <div className="feature-row">
              <div className="feature-item">Size</div>
              <div className="feature-description">{phone.features?.display?.size || 'N/A'} inches</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Type</div>
              <div className="feature-description">{phone.features?.display?.type || 'N/A'}</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Resolution</div>
              <div className="feature-description">{phone.features?.display?.resolution || 'N/A'}</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Refresh Rate</div>
              <div className="feature-description">{phone.features?.display?.refreshRate || 'N/A'} Hz</div>
            </div>
          </div>

          {/* Processor */}
          <div className="feature-category">
            <div className="category-title">Processor</div>
            <div className="feature-row">
              <div className="feature-item">Name</div>
              <div className="feature-description">{phone.features?.processor?.name || 'N/A'}</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Benchmark Score</div>
              <div className="feature-description">{phone.features?.processor?.benchmarkScore || 'N/A'}</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Cores</div>
              <div className="feature-description">{phone.features?.processor?.cores || 'N/A'}</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Clock Speed</div>
              <div className="feature-description">{phone.features?.processor?.clockSpeed || 'N/A'} GHz</div>
            </div>
          </div>

          {/* Memory */}
          <div className="feature-category">
            <div className="category-title">Memory</div>
            <div className="feature-row">
              <div className="feature-item">RAM</div>
              <div className="feature-description">{phone.features?.memory?.ram || 'N/A'} GB</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Storage</div>
              <div className="feature-description">{phone.features?.memory?.storage || 'N/A'} GB</div>
            </div>
            <div className="feature-row">
              <div className="feature-item">Expandable</div>
              <div className="feature-description">{phone.features?.memory?.expandable ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {/* OS */}
          <div className="feature-category">
            <div className="category-title">OS</div>
            <div className="feature-description">{phone.features?.os || 'N/A'}</div>
          </div>

          {/* Network */}
          <div className="feature-category">
            <div className="category-title">Network</div>
            <div className="feature-description">{Array.isArray(phone.features?.network) ? phone.features?.network.join(", ") : 'N/A'}</div>
          </div>

          {/* SIM */}
          <div className="feature-category">
            <div className="category-title">SIM</div>
            <div className="feature-description">{phone.features?.sim || 'N/A'}</div>
          </div>

          {/* Dimensions */}
          <div className="feature-category">
            <div className="category-title">Dimensions</div>
            <div className="feature-description">{phone.features?.dimensions || 'N/A'}</div>
          </div>

          {/* Weight */}
          <div className="feature-category">
            <div className="category-title">Weight</div>
            <div className="feature-description">{phone.features?.weight || 'N/A'} grams</div>
          </div>
        </div>
      </div>




      <div className="rating-section">
        <h3>Average User Ratings</h3>
        {averageRatings ? (
          <ul>
            <li>📸 Camera: {averageRatings.avgCamera?.toFixed(1)} ⭐</li>
            <li>🔋 Battery: {averageRatings.avgBattery?.toFixed(1)} ⭐</li>
            <li>🖥️ Display: {averageRatings.avgDisplay?.toFixed(1)} ⭐</li>
            <li>⚙️ Processor: {averageRatings.avgProcessor?.toFixed(1)} ⭐</li>
            <li>🗳️ Total Ratings: {averageRatings.count}</li>
          </ul>
        ) : (
          <p>No ratings yet.</p>
        )}
      </div>
      
      <section className="comments-section">
        <h3>Comments</h3>
        {comments.length
          ? comments.map(c => (
            <div key={c._id} className="comment-card">
              <strong>{c.userName || 'Anonymous'}</strong>
              <p>{c.content}</p>
              <span className="comment-date">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
          ))
          : <p>No comments yet.</p>
        }
        <div className="comment-form">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write your comment…"
          />
          <button onClick={postComment}>Post Comment</button>
        </div>
      </section>

      {!hasRated ? (
        <div className="submit-rating-section">
          <h3>Submit Your Rating</h3>
          <form onSubmit={submitRating} className="rating-form">
            {["camera", "battery", "display", "processor"].map((feature) => (
              <div key={feature}>
                <label>{feature.toUpperCase()}:</label>
                <select
                  value={ratingInput[feature]}
                  onChange={(e) => handleInputChange(feature, e.target.value)}
                >
                  <option value={0}>Select</option>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>{v} ⭐</option>
                  ))}
                </select>
              </div>
            ))}
            <button type="submit">Submit Rating</button>
          </form>
        </div>
      ) : (
        <div className="rating-done-message">
          <h3>Rating Done!</h3>
          <p>Thank you for your feedback. You have already rated this product.</p>
        </div>
      )}

      <h3>You might also like:</h3>
      <div className="related-phones">
        {Array.isArray(relatedPhones) && relatedPhones.length > 0 ? (
          relatedPhones.map((phone) => (
            <a href={`/phone/${phone._id}`} key={phone._id} className="related-phone-link">
              <div className="related-phone-card">
                <img
                  src={phone.imageUrls && phone.imageUrls.length > 0 ? phone.imageUrls[0] : "https://via.placeholder.com/200"}
                  alt={phone.name}
                />
                <h4>{phone.name}</h4>
                <p>${phone.price}</p>
              </div>
            </a>
          ))
        ) : (
          <p>No related phones found.</p>
        )}
      </div>
    </div>

    
  );
};

export default PhoneDetails;
